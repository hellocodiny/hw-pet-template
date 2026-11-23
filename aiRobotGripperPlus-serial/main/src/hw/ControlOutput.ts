import { commandFrame, initialOutput, modeZero, numberIn, relayFrame } from './protocol';
import type { OutputState } from './protocol';
/** Wire format matches the supplied PC transport. Group pacing is at least 110ms. */
export class ControlOutput {
  state: OutputState = initialOutput();
  targets: number[] = [];
  active = false;
  private epoch = 0;
  private seq = 0;
  private chain: Promise<void> = Promise.resolve();
  private queued = 0;
  private lastSent = 0;
  private noteVersion = 0;
  private moveVersion = 0;
  private held = new Set<() => void>();
  private heartbeat?: ReturnType<typeof setInterval>;
  constructor(
    private write: (b: Uint8Array) => Promise<void>,
    private changed: () => void,
    private fault: (e: unknown) => void,
  ) {}
  frame(command: ArrayLike<number>, ids = this.targets) {
    return relayFrame(ids, this.seq++ & 255, command);
  }
  configure(ids: number[]) {
    this.cancel();
    this.targets = [...ids];
    this.state = { ...this.state, motor: 0, pwm: null, tone: 0 };
    this.changed();
  }
  cancel() {
    this.epoch++;
    this.noteVersion++;
    this.moveVersion++;
    this.active = false;
    clearInterval(this.heartbeat);
    this.heartbeat = undefined;
    for (const resolve of this.held) resolve();
    this.held.clear();
    this.state = { ...this.state, motor: 0, pwm: null, tone: 0 };
    this.changed();
  }
  async drain() {
    await this.chain;
  }
  private delay(ms: number) {
    return new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timer);
        this.held.delete(done);
        resolve();
      };
      const timer = setTimeout(done, ms);
      this.held.add(done);
    });
  }
  private send(command: Uint8Array) {
    if (this.queued >= 8) {
      const e = new Error('제어 전송 대기열 초과');
      this.cancel();
      this.fault(e);
      return Promise.reject(e);
    }
    const epoch = this.epoch,
      ids = [...this.targets];
    this.queued++;
    const task = this.chain.then(async () => {
      if (epoch !== this.epoch) throw new Error('제어 명령이 취소되었습니다.');
      const interval = ids.length > 1 ? 110 : 32;
      await this.delay(Math.max(0, interval - (Date.now() - this.lastSent)));
      if (epoch !== this.epoch) throw new Error('제어 명령이 취소되었습니다.');
      await this.write(this.frame(command, ids));
      this.lastSent = Date.now();
    });
    this.chain = task
      .catch((e) => {
        if (epoch === this.epoch) {
          this.cancel();
          this.fault(e);
        }
      })
      .finally(() => {
        this.queued--;
      });
    return task;
  }
  private arm() {
    if (!this.targets.length) throw new Error('제어 대상이 없습니다.');
    this.active = true;
    if (!this.heartbeat)
      this.heartbeat = setInterval(() => {
        if (
          !this.active ||
          this.queued ||
          Date.now() - this.lastSent < 300 ||
          (!this.state.motor && !this.state.tone)
        )
          return;
        // Keep held motion/tone alive without overflowing the module's group FIFO.
        void this.send(this.state.pwm === null ? commandFrame(this.state) : this.pwmFrame()).catch(
          () => {},
        );
      }, 100);
  }
  private pwmFrame() {
    return Uint8Array.from([255, 85, 165, this.state.pwm!, 0, 0, 0, 0, 0, 0, 0, this.state.motor]);
  }
  servo = async (channel: number, angle: number) => {
    numberIn(channel, 1, 3);
    if (!Number.isInteger(channel)) throw new Error('관절 번호 오류');
    numberIn(angle, 0, 180);
    this.arm();
    this.state.angles[channel - 1] = Math.round(angle);
    this.changed();
    await this.send(commandFrame(this.state));
  };
  pixel = async (target: number, r: number, g: number, b: number) => {
    numberIn(target, 0, 6);
    if (!Number.isInteger(target)) throw new Error('LED 번호 오류');
    [r, g, b].forEach((v) => numberIn(v, 0, 255));
    this.arm();
    this.state.pixel = target;
    this.state.rgb = [r, g, b].map(Math.round);
    this.changed();
    await this.send(commandFrame(this.state));
  };
  motor = async (direction: number, speed?: number) => {
    numberIn(direction, 0, 4);
    if (!Number.isInteger(direction)) throw new Error('방향 오류');
    if (speed !== undefined) {
      numberIn(speed, 0, 255);
      if (![1, 3, 4].includes(direction))
        throw new Error('속도 지정은 전진/좌회전/우회전만 지원합니다.');
    }
    this.moveVersion++;
    this.arm();
    this.state.motor = direction;
    this.state.pwm = speed === undefined ? null : Math.round(speed);
    this.changed();
    await this.send(speed === undefined ? commandFrame(this.state) : this.pwmFrame());
  };
  moveFor = async (direction: number, seconds: number, speed?: number) => {
    numberIn(seconds, 0, 3600);
    if (seconds === 0) {
      await this.motor(0);
      return;
    }
    await this.motor(direction, speed);
    const version = this.moveVersion,
      epoch = this.epoch;
    await this.delay(seconds * 1000);
    if (epoch === this.epoch && version === this.moveVersion) await this.motor(0);
  };
  tone = async (frequency: number) => {
    numberIn(frequency, 0, 2040);
    this.noteVersion++;
    this.arm();
    this.state.tone = frequency;
    this.changed();
    await this.send(commandFrame(this.state));
  };
  playNote = async (octave: number, note: number, seconds: number) => {
    numberIn(octave, 2, 6);
    numberIn(note, 0, 11);
    numberIn(seconds, 0, 3600);
    if (!Number.isInteger(octave) || !Number.isInteger(note))
      throw new Error('옥타브/음계는 정수여야 합니다.');
    const frequency = Math.min(2040, 440 * Math.pow(2, ((octave + 1) * 12 + note - 69) / 12));
    await this.tone(seconds > 0 ? frequency : 0);
    const version = this.noteVersion,
      epoch = this.epoch;
    await this.delay(seconds * 1000);
    if (epoch === this.epoch && version === this.noteVersion) await this.tone(0);
  };
  /** Cancels pending work before sending LED-off and MODE=0 to old targets. */
  stop = async () => {
    const wasActive = this.active,
      ids = [...this.targets];
    this.cancel();
    await this.drain();
    if (!ids.length) return;
    if (wasActive) {
      this.state.pixel = 2;
      this.state.rgb = [0, 0, 0];
      await this.write(this.frame(commandFrame(this.state), ids));
      await this.delay(ids.length > 1 ? 110 : 32);
    }
    await this.write(this.frame(modeZero(), ids));
    this.changed();
  };
}
