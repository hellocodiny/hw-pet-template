import {
  BAUD_RATE,
  TX_INTERVAL_MS,
  SensorParser,
  defaultOutput,
  index,
  integer,
  packet,
  scaleSensor,
  stopOutput,
} from './protocol';
import type { OutputState, RGB } from './protocol';

export interface RobotStatus {
  connection: 'disconnected' | 'connecting' | 'connected';
  stopped: boolean;
  message: string;
  error: string;
  raw: number[] | null;
  sensors: number[] | null;
  receivedAt: number;
  rxCount: number;
  txCount: number;
  output: OutputState;
}
interface SerialSession {
  port: SerialPort;
  reader: ReadableStreamDefaultReader<Uint8Array>;
  writer: WritableStreamDefaultWriter<Uint8Array>;
  readTask: Promise<void>;
  writeTask: Promise<void> | null;
  active: boolean;
  allowTx: boolean;
  readyFrames: number;
}
interface Timing {
  settle: number;
  handshake: number;
  stale: number;
  write: number;
}
// Old Nano bootloaders can take longer to yield to the sketch after USB reset.
// This is a maximum, not a fixed delay; fast boards keep their normal startup.
const timing: Timing = { settle: 1200, handshake: 15000, stale: 1500, write: 1000 };
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
async function bounded<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export class RobotController {
  private status: RobotStatus = {
    connection: 'disconnected',
    stopped: true,
    message: 'USB 케이블을 연결하고 USB 연결을 누르세요.',
    error: '',
    raw: null,
    sensors: null,
    receivedAt: 0,
    rxCount: 0,
    txCount: 0,
    output: defaultOutput(),
  };
  private listeners = new Set<() => void>();
  private session: SerialSession | null = null;
  private serial: Serial | null = null;
  private generation = 0;
  private connecting: Promise<boolean> | null = null;
  private closing: Promise<void> | null = null;
  private timer: ReturnType<typeof setInterval> | undefined;
  private turn = 0;
  private lastTx = 0;
  private noteGeneration = 0;
  private noteWaitCancel: (() => void) | null = null;
  private cancelNote(): void {
    ++this.noteGeneration;
    this.noteWaitCancel?.();
    this.noteWaitCancel = null;
  }
  private disconnectListener = (event: Event) => {
    if (
      event.target === this.session?.port ||
      (event as Event & { port?: SerialPort }).port === this.session?.port
    ) {
      this.fail('USB 연결이 끊어졌습니다. 케이블을 확인한 뒤 다시 연결하세요.');
    }
  };
  constructor(
    private getSerial: () => Serial = () => {
      if (typeof navigator === 'undefined' || !('serial' in navigator))
        throw new Error('PC용 Chrome 또는 Edge에서 실행하세요.');
      if (!window.isSecureContext) throw new Error('localhost 또는 HTTPS 주소에서 실행하세요.');
      return navigator.serial;
    },
    private limits: Timing = timing,
  ) {}

  getSnapshot = (): RobotStatus => this.status;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private update(values: Partial<RobotStatus> = {}): void {
    const output = values.output ?? this.status.output;
    this.status = {
      ...this.status,
      ...values,
      output: {
        ...output,
        angles: [...output.angles],
        pixels: output.pixels.map((c) => [...c]) as [RGB, RGB],
      },
    };
    this.listeners.forEach((fn) => fn());
  }
  connect = (): Promise<boolean> => {
    if (this.connecting) return this.connecting;
    if (this.closing)
      return Promise.reject(new Error('연결을 해제하는 중입니다. 잠시 후 다시 시도하세요.'));
    if (this.status.connection === 'connected') return Promise.resolve(true);
    const token = ++this.generation;
    // requestPort is called synchronously within the user's click, before any await.
    this.connecting = this.open(token).finally(() => {
      this.connecting = null;
    });
    return this.connecting;
  };
  private async open(token: number): Promise<boolean> {
    this.update({
      connection: 'connecting',
      stopped: true,
      error: '',
      raw: null,
      sensors: null,
      receivedAt: 0,
      rxCount: 0,
      txCount: 0,
      output: defaultOutput(),
      message: '포트를 선택하세요. 연결 후 센서 데이터를 확인합니다.',
    });
    let localPort: SerialPort | null = null;
    try {
      this.serial = this.getSerial();
      localPort = await this.serial.requestPort();
      if (token !== this.generation) return false;
      const portToOpen = localPort;
      const opening = portToOpen.open({
        baudRate: BAUD_RATE,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
      });
      void opening
        .then(() => {
          if (token !== this.generation) return portToOpen.close().catch(() => {});
        })
        .catch(() => {});
      await bounded(
        opening,
        8000,
        '포트 열기 시간 초과. 다른 앱을 종료하고 케이블을 다시 연결하세요.',
      );
      if (token !== this.generation) return false;
      if (!localPort.readable || !localPort.writable)
        throw new Error('포트 읽기/쓰기를 사용할 수 없습니다.');
      const s: SerialSession = {
        port: localPort,
        reader: localPort.readable.getReader(),
        writer: localPort.writable.getWriter(),
        readTask: Promise.resolve(),
        writeTask: null,
        active: true,
        allowTx: false,
        readyFrames: 0,
      };
      this.session = s;
      this.serial.addEventListener('disconnect', this.disconnectListener);
      s.readTask = this.readLoop(s);
      const openedAt = Date.now();
      this.update({
        message: `로봇 시작 대기 · 구형 부트로더는 최대 ${this.limits.handshake / 1000}초 기다립니다.`,
      });
      // Allow Nano reset/startup. Wait for >=2 frames after settling; don't use setup's dummy frame.
      await delay(this.limits.settle);
      s.readyFrames = 0;
      while (token === this.generation && s.active && s.readyFrames < 2) {
        if (Date.now() - openedAt > this.limits.handshake)
          throw new Error(
            `센서 응답 확인 시간 초과 (${((Date.now() - openedAt) / 1000).toFixed(1)}초, 수신 ${this.status.rxCount}개). AI로봇집게 포트·전원·펌웨어를 확인하세요.`,
          );
        await delay(20);
      }
      if (token !== this.generation || !s.active) return false;
      s.allowTx = true;
      this.turn = 0;
      this.lastTx = Date.now();
      this.update({
        connection: 'connected',
        stopped: false,
        message: `연결 완료 (${((Date.now() - openedAt) / 1000).toFixed(1)}초) · 관절 목표각 90° · 30ms 주기 송신`,
      });
      await this.write(s);
      if (this.session !== s || !s.active) return false;
      this.timer = setInterval(() => {
        if (Date.now() - this.lastTx > this.limits.stale) {
          this.fail('송신이 지연되어 연결을 종료했습니다. 다시 연결하세요.');
          return;
        }
        if (Date.now() - this.status.receivedAt > this.limits.stale) {
          this.fail('센서 수신이 중단되었습니다. 케이블·전원을 확인하세요.');
          return;
        }
        if (!s.writeTask)
          void this.write(s).catch((error) => {
            this.fail(this.errorText(error));
          });
      }, TX_INTERVAL_MS);
      return true;
    } catch (error) {
      if (token !== this.generation) return false;
      const cancelled = (error as { name?: string }).name === 'NotFoundError';
      const message = cancelled ? '' : this.errorText(error);
      if (message) this.update({ error: message });
      if (!this.session && localPort?.readable) await localPort.close().catch(() => {});
      await this.disconnect();
      this.update({
        message: cancelled
          ? '포트 선택을 취소했습니다.'
          : '연결하지 못했습니다. 다른 앱의 포트 사용 여부도 확인하세요.',
      });
      return false;
    }
  }
  private errorText(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
  private async readLoop(s: SerialSession): Promise<void> {
    let recoveries = 0;
    while (s.active && this.session === s) {
      // A read error can lose bytes. Never join a partial old frame to a new stream.
      const parser = new SensorParser();
      const reader = s.reader;
      let readError: unknown;
      try {
        while (s.active && this.session === s) {
          const result = await reader.read();
          if (!s.active || this.session !== s) return;
          if (result.done) throw new Error('USB 데이터 스트림이 종료되었습니다.');
          for (const raw of parser.push(result.value)) {
            s.readyFrames++;
            this.update({
              raw,
              sensors: raw.map(scaleSensor),
              receivedAt: Date.now(),
              rxCount: this.status.rxCount + 1,
            });
          }
        }
      } catch (error) {
        readError = error;
      } finally {
        reader.releaseLock();
      }
      if (!s.active || this.session !== s) return;
      const name = (readError as { name?: string } | undefined)?.name;
      const message = this.errorText(readError);
      const recoverable =
        ['BufferOverrunError', 'FramingError', 'ParityError'].includes(name || '') ||
        /buffer overrun/i.test(message);
      // Chrome supplies a new readable stream for non-fatal serial errors.
      // Limit retries; persistent faults and unplugging must still disconnect.
      if (recoverable && recoveries < 3 && s.port.readable) {
        recoveries++;
        s.readyFrames = 0;
        this.update({
          raw: null,
          sensors: null,
          message: `USB 수신 복구 ${recoveries}/3 · ${message}`,
        });
        try {
          s.reader = s.port.readable.getReader();
        } catch (error) {
          this.fail(this.errorText(error));
          return;
        }
        continue;
      }
      this.fail(recoverable ? `USB 수신 복구 실패: ${message}` : message);
      return;
    }
  }
  private async write(s: SerialSession): Promise<void> {
    if (s.writeTask) await s.writeTask;
    if (!s.active || !s.allowTx) return;
    const bytes = packet(this.status.output, this.turn++);
    const pending = bounded(s.writer.write(bytes), this.limits.write, 'USB 송신 시간 초과');
    s.writeTask = pending;
    try {
      await pending;
      this.lastTx = Date.now();
      if (s.active) this.update({ txCount: this.status.txCount + 1 });
    } finally {
      if (s.writeTask === pending) s.writeTask = null;
    }
  }
  private fail(message: string): void {
    this.update({ error: message });
    void this.disconnect();
  }
  disconnect = (): Promise<void> => {
    if (this.closing) return this.closing;
    ++this.generation;
    this.cancelNote();
    clearInterval(this.timer);
    this.timer = undefined;
    const s = this.session;
    this.session = null;
    this.serial?.removeEventListener('disconnect', this.disconnectListener);
    stopOutput(this.status.output);
    this.update({
      connection: 'disconnected',
      stopped: true,
      raw: null,
      sensors: null,
      receivedAt: 0,
      message: '연결 해제 · 마지막 명령 수신 후 약 2초가 지나면 수동 모드로 복귀합니다.',
    });
    if (!s) return Promise.resolve();
    this.closing = this.close(s).finally(() => {
      this.closing = null;
    });
    return this.closing;
  };
  private async close(s: SerialSession): Promise<void> {
    try {
      if (s.writeTask) await s.writeTask.catch(() => {});
      // Best effort outputs-off packet; do not send MODE=0 or change servo targets.
      await this.write(s).catch(() => {});
    } finally {
      s.active = false;
      await bounded(s.reader.cancel(), 1000, '읽기 취소 지연').catch(() => {});
      await bounded(s.readTask, 1000, '읽기 종료 지연').catch(() => {});
      await bounded(s.writer.abort(), 1000, '쓰기 종료 지연').catch(() => {});
      try {
        s.writer.releaseLock();
      } catch {
        /* pending USB write */
      }
      await bounded(s.port.close(), 1000, '포트 종료 지연').catch((error) => {
        this.update({
          error: `포트 종료: ${this.errorText(error)}. 필요하면 케이블을 다시 연결하세요.`,
        });
      });
    }
  }
  private assertConnected(): void {
    if (this.status.connection !== 'connected') throw new Error('로봇을 먼저 연결하세요.');
  }
  private assertControl(): void {
    this.assertConnected();
    if (this.status.stopped)
      throw new Error('정지 상태입니다. 제어 재개 또는 start()를 먼저 실행하세요.');
  }
  start = async (): Promise<void> => {
    this.assertConnected();
    this.update({ stopped: false, message: '제어 가능 · 30ms 주기 송신' });
  };
  stop = async (): Promise<void> => {
    this.assertConnected();
    this.cancelNote();
    stopOutput(this.status.output);
    this.update({
      stopped: true,
      message: '정지 · 마지막 관절 목표각 유지 · LED/부저 꺼짐 · 통신 유지',
    });
    if (this.session)
      await this.write(this.session).catch((error) => {
        this.fail(this.errorText(error));
      });
  };
  servo = async (channel: number, angle: number): Promise<void> => {
    this.assertControl();
    this.status.output.angles[index(channel, 1, 3) - 1] = integer(angle, 0, 180);
    this.update();
  };
  servos = async (ud: number, lr: number, gr: number): Promise<void> => {
    this.assertControl();
    this.status.output.angles = [integer(ud, 0, 180), integer(lr, 0, 180), integer(gr, 0, 180)];
    this.update();
  };
  /** UI/API index: 0=first, 1=second, 2=all; matches PC protocol. */
  pixel = async (which: number, r: number, g: number, b: number): Promise<void> => {
    this.assertControl();
    index(which, 0, 2);
    const color: RGB = [integer(r, 0, 255), integer(g, 0, 255), integer(b, 0, 255)];
    if (which === 2) this.status.output.pixels = [[...color], [...color]];
    else this.status.output.pixels[which] = color;
    this.update();
  };
  tone = async (hz: number): Promise<void> => {
    this.assertControl();
    const value = integer(hz / 8, 0, 255);
    this.cancelNote();
    this.status.output.buzzer = value;
    this.update();
  };
  /** Scientific pitch notation: octave 2..6, semitone C=0 .. B=11.
   * Existing firmware represents frequency as one byte times 8 Hz.
   */
  playNote = async (octave: number, semitone: number, seconds: number): Promise<void> => {
    this.assertControl();
    index(octave, 2, 6);
    index(semitone, 0, 11);
    if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 8)
      throw new Error('연주 시간은 0초 초과 8초 이하입니다.');
    this.cancelNote();
    const token = this.noteGeneration;
    const s = this.session;
    if (!s) throw new Error('로봇을 먼저 연결하세요.');
    const hz = 440 * 2 ** (((octave + 1) * 12 + semitone - 69) / 12);
    this.status.output.buzzer = integer(hz / 8, 0, 255);
    this.update();
    try {
      // Measure the duration after the initial output write completes.
      await this.write(s);
      if (token !== this.noteGeneration || this.session !== s) return;
      await new Promise<void>((resolve) => {
        const finish = () => {
          clearTimeout(timer);
          if (this.noteWaitCancel === finish) this.noteWaitCancel = null;
          resolve();
        };
        const timer = setTimeout(finish, seconds * 1000);
        this.noteWaitCancel = finish;
      });
    } catch (error) {
      if (token === this.noteGeneration) this.fail(this.errorText(error));
      throw error;
    } finally {
      // A stopped/disconnected/replaced note must never silence a newer command.
      if (token === this.noteGeneration && this.session === s && s.active) {
        this.status.output.buzzer = 0;
        this.update();
        await this.write(s).catch((error) => {
          this.fail(this.errorText(error));
        });
      }
    }
  };
  blue = async (value: number): Promise<void> => {
    this.assertControl();
    this.status.output.blue = integer(value, 0, 255);
    this.update();
  };
  sensor = async (which: number): Promise<number> => {
    this.assertConnected();
    index(which, 0, 4);
    if (!this.status.sensors || Date.now() - this.status.receivedAt > this.limits.stale)
      throw new Error('최신 센서값이 없습니다.');
    return this.status.sensors[which];
  };
  /** Clamp the input fraction; keep decimals until the output command rounds. */
  mapSensor = async (
    which: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number,
  ): Promise<number> => {
    if (![inMin, inMax, outMin, outMax].every(Number.isFinite))
      throw new Error('변환 범위에는 유한한 숫자를 입력하세요.');
    if (inMin === inMax) throw new Error('센서 입력 범위의 시작과 끝은 달라야 합니다.');
    if (!Number.isFinite(inMax - inMin)) throw new Error('센서 입력 범위가 너무 큽니다.');
    const value = await this.sensor(which);
    const fraction = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
    const result = outMin * (1 - fraction) + outMax * fraction;
    if (!Number.isFinite(result)) throw new Error('변환 범위가 너무 큽니다.');
    return result;
  };
}
