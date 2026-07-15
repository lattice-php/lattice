import type { CSSProperties } from "react";
import type { Color, ColorName } from "@lattice-php/lattice/types/generated";

const names: ReadonlySet<string> = new Set([
  "default",
  "muted",
  "primary",
  "success",
  "info",
  "warning",
  "danger",
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
] satisfies ColorName[]);

export function namedColor(value: ColorName): Color {
  return { kind: "named", value, dark: null };
}

export function coerceColor(value: unknown): Color | undefined {
  if (typeof value === "string" && value !== "") {
    return names.has(value) ? namedColor(value as ColorName) : { kind: "css", value, dark: null };
  }

  if (typeof value === "object" && value !== null && "kind" in value && "value" in value) {
    return value as Color;
  }

  return undefined;
}

export function colorValue(color: Color): string {
  if (color.kind === "named") {
    return `var(--lt-color-${color.value})`;
  }

  return color.dark === null ? color.value : `light-dark(${color.value}, ${color.dark})`;
}

export function toneProps(color: Color): { className?: string; style?: CSSProperties } {
  if (color.kind === "named") {
    return { className: `lt-tone-${color.value}` };
  }

  const paint = colorValue(color);

  return {
    style: {
      "--lt-tone-bg": `color-mix(in oklab, ${paint} 12%, transparent)`,
      "--lt-tone-fg": paint,
    } as CSSProperties,
  };
}
