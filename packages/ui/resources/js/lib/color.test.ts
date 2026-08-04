import { describe, expect, it } from "vitest";
import { coerceColor, colorValue, namedColor, toneProps } from "./color";

describe("coerceColor", () => {
  it("coerces known names to named colors", () => {
    expect(coerceColor("green")).toEqual({ kind: "named", value: "green", dark: null });
  });

  it("coerces unknown strings to css colors", () => {
    expect(coerceColor("#dc2626")).toEqual({ kind: "css", value: "#dc2626", dark: null });
  });

  it("passes tagged colors through", () => {
    const color = { kind: "css", value: "#2563eb", dark: "#60a5fa" } as const;
    expect(coerceColor(color)).toBe(color);
  });

  it("returns undefined for empty and non-color values", () => {
    expect(coerceColor("")).toBeUndefined();
    expect(coerceColor(null)).toBeUndefined();
    expect(coerceColor(undefined)).toBeUndefined();
    expect(coerceColor(42)).toBeUndefined();
  });
});

describe("colorValue", () => {
  it("resolves named colors to palette vars", () => {
    expect(colorValue(namedColor("success"))).toBe("var(--lt-color-success)");
  });

  it("passes css colors through", () => {
    expect(colorValue({ kind: "css", value: "#2563eb", dark: null })).toBe("#2563eb");
  });

  it("emits light-dark() for css colors with a dark counterpart", () => {
    expect(colorValue({ kind: "css", value: "#2563eb", dark: "#60a5fa" })).toBe(
      "light-dark(#2563eb, #60a5fa)",
    );
  });
});

describe("toneProps", () => {
  it("resolves named colors to tone classes", () => {
    expect(toneProps(namedColor("green"))).toEqual({ className: "lt-tone-green" });
  });

  it("derives an inline tone pair for css colors", () => {
    expect(toneProps({ kind: "css", value: "#dc2626", dark: null })).toEqual({
      style: {
        "--lt-tone-bg": "color-mix(in oklab, #dc2626 12%, transparent)",
        "--lt-tone-fg": "#dc2626",
      },
    });
  });
});
