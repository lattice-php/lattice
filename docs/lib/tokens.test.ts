import { describe, expect, it } from "vitest";
import { parseTokens, parseSuffixMap } from "./tokens";

const SAMPLE_CSS = `
:root,
[data-theme="light"] {
  --lt-bg: var(--background, oklch(1 0 0));
  --lt-primary: var(--primary, oklch(0.205 0 0));
  --lt-radius: var(--radius, 0.625rem);
  --lt-radius-sm: calc(var(--lt-radius) - 2px);
  color-scheme: light;
}

[data-theme="dark"],
.dark {
  --lt-bg: var(--background, oklch(0.145 0 0));
  --lt-primary: var(--primary, oklch(0.985 0 0));
  color-scheme: dark;
}

@theme inline {
  --color-lt-bg: var(--lt-bg);
  --color-lt-primary: var(--lt-primary);
  --radius-lt: var(--lt-radius);
  --radius-lt-sm: var(--lt-radius-sm);
}
`;

describe("parseTokens", () => {
  it("extracts host var and light/dark defaults", () => {
    const tokens = parseTokens(SAMPLE_CSS);
    const primary = tokens.find((t) => t.name === "--lt-primary");
    expect(primary).toEqual({
      name: "--lt-primary",
      hostVar: "--primary",
      light: "oklch(0.205 0 0)",
      dark: "oklch(0.985 0 0)",
      category: "color",
    });
  });

  it("treats radius tokens as the radius category and reuses light value when dark is absent", () => {
    const tokens = parseTokens(SAMPLE_CSS);
    const radiusSm = tokens.find((t) => t.name === "--lt-radius-sm");
    expect(radiusSm).toMatchObject({
      category: "radius",
      light: "calc(var(--lt-radius) - 2px)",
      dark: "calc(var(--lt-radius) - 2px)",
      hostVar: null,
    });
  });

  it("ignores non-token declarations like color-scheme", () => {
    const tokens = parseTokens(SAMPLE_CSS);
    expect(tokens.some((t) => t.name.includes("color-scheme"))).toBe(false);
  });
});

describe("parseSuffixMap", () => {
  it("maps tailwind utility suffixes to their underlying token", () => {
    expect(parseSuffixMap(SAMPLE_CSS)).toEqual({
      "lt-bg": "--lt-bg",
      "lt-primary": "--lt-primary",
      lt: "--lt-radius",
      "lt-sm": "--lt-radius-sm",
    });
  });
});
