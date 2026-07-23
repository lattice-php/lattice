const LIGHT_FG = "oklch(0.985 0 0)";
const DARK_FG = "oklch(0.205 0 0)";

export type Oklch = { l: number; c: number; h: number; alpha: number | null };

const OKLCH = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)$/;

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function parseOklch(value: string): Oklch | null {
  const match = value.trim().match(OKLCH);
  if (!match) {
    return null;
  }
  return {
    l: Number(match[1]),
    c: Number(match[2]),
    h: Number(match[3]),
    alpha: match[4] === undefined ? null : Number(match[4]),
  };
}

function format({ l, c, h, alpha }: Oklch): string {
  const base = `oklch(${round(l)} ${round(c)} ${round(h)}`;
  return alpha === null ? `${base})` : `${base} / ${round(alpha)})`;
}

export function shiftLightness(value: string, delta: number): string {
  const parsed = parseOklch(value);
  if (!parsed) {
    return value;
  }
  return format({ ...parsed, l: Math.min(1, Math.max(0, parsed.l + delta)) });
}

export function readableForeground(value: string): string {
  const parsed = parseOklch(value);
  if (!parsed) {
    return LIGHT_FG;
  }
  return parsed.l >= 0.6 ? DARK_FG : LIGHT_FG;
}

function cbrt(x: number): number {
  return x < 0 ? -Math.pow(-x, 1 / 3) : Math.pow(x, 1 / 3);
}

function parseRgbChannels(value: string): [number, number, number] | null {
  const hex = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3,4}$/.test(hex)) {
    const r = hex[0],
      g = hex[1],
      b = hex[2];
    return [parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16)];
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex) || /^[0-9a-fA-F]{8}$/.test(hex)) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  const rgb = value.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }
  return null;
}

function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function normalizeToOklch(value: string): string {
  if (parseOklch(value)) {
    return value;
  }
  const channels = parseRgbChannels(value);
  if (!channels) {
    return value;
  }
  const [r, g, b] = channels.map(linearize);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = cbrt(l),
    m_ = cbrt(m),
    s_ = cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = round(Math.sqrt(A * A + B * B));
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) {
    H += 360;
  }
  return `oklch(${round(L)} ${C} ${C === 0 ? 0 : round(H)})`;
}
