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
