/** Existing AISERVO firmware protocol; no firmware changes. */
export type RGB = [number, number, number];
export interface OutputState {
  angles: [number, number, number];
  pixels: [RGB, RGB];
  buzzer: number;
  blue: number;
}
export const TX_INTERVAL_MS = 30;
export const BAUD_RATE = 115200;
export function integer(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) throw new Error('유효한 숫자를 입력하세요.');
  return Math.max(min, Math.min(max, Math.round(value)));
}
export function index(value: number, min: number, max: number): number {
  if (!Number.isInteger(value) || value < min || value > max)
    throw new Error('잘못된 채널 번호입니다.');
  return value;
}
export function defaultOutput(): OutputState {
  return {
    angles: [90, 90, 90],
    pixels: [
      [0, 0, 0],
      [0, 0, 0],
    ],
    buzzer: 0,
    blue: 0,
  };
}
export function stopOutput(state: OutputState): void {
  state.pixels = [
    [0, 0, 0],
    [0, 0, 0],
  ];
  state.buzzer = 0;
  state.blue = 0;
}
export function packet(state: OutputState, turn: number): Uint8Array {
  const equal = state.pixels[0].every((v, i) => v === state.pixels[1][i]);
  const pixel = equal ? 2 : turn % 2;
  const rgb = state.pixels[pixel === 2 ? 0 : pixel];
  return new Uint8Array([255, 85, 1, ...state.angles, pixel, ...rgb, state.buzzer, state.blue]);
}
export const scaleSensor = (value: number): number => Math.round((value * 1023) / 255);

/** Persistent streaming parser: preserve split headers; consume exact 7-byte frames.
 * Firmware has no checksum or identity: corrupted aligned payload cannot be validated.
 */
export class SensorParser {
  private bytes: number[] = [];
  push(chunk: Uint8Array): number[][] {
    const frames: number[][] = [];
    for (const b of chunk) {
      this.bytes.push(b);
      while (this.bytes.length >= 2 && (this.bytes[0] !== 255 || this.bytes[1] !== 85))
        this.bytes.shift();
      if (this.bytes.length === 7) {
        frames.push(this.bytes.slice(2));
        this.bytes = [];
      }
    }
    return frames;
  }
}
