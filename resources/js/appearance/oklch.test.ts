import { describe, expect, it } from "vitest";
import { parseOklch, readableForeground, shiftLightness } from "./oklch";

describe("parseOklch", () => {
  it("parses L C H", () => {
    expect(parseOklch("oklch(0.55 0.2 265)")).toEqual({ l: 0.55, c: 0.2, h: 265, alpha: null });
  });

  it("parses an alpha channel", () => {
    expect(parseOklch("oklch(0 0 0 / 0.5)")).toEqual({ l: 0, c: 0, h: 0, alpha: 0.5 });
  });

  it("returns null for non-oklch values", () => {
    expect(parseOklch("#2563eb")).toBeNull();
  });
});

describe("shiftLightness", () => {
  it("shifts lightness and keeps chroma and hue", () => {
    expect(shiftLightness("oklch(0.48 0.092 182)", -0.05)).toBe("oklch(0.43 0.092 182)");
  });

  it("clamps to the [0, 1] range", () => {
    expect(shiftLightness("oklch(0.97 0 0)", 0.1)).toBe("oklch(1 0 0)");
  });

  it("returns the input unchanged when it is not oklch", () => {
    expect(shiftLightness("#2563eb", -0.05)).toBe("#2563eb");
  });
});

describe("readableForeground", () => {
  it("returns dark foreground on a light color", () => {
    expect(readableForeground("oklch(0.9 0.05 100)")).toBe("oklch(0.205 0 0)");
  });

  it("returns light foreground on a dark color", () => {
    expect(readableForeground("oklch(0.48 0.092 182)")).toBe("oklch(0.985 0 0)");
  });

  it("falls back to the light foreground for non-oklch colors", () => {
    expect(readableForeground("#2563eb")).toBe("oklch(0.985 0 0)");
  });
});
