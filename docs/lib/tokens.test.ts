import { describe, expect, it } from "vitest";
import { parseTokens, parseSuffixMap, resolveTokens, tokenLabel, collectClassNames } from "./tokens";

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

const SUFFIX_MAP = {
  "lt-primary": "--lt-primary",
  "lt-primary-fg": "--lt-primary-fg",
  "lt-ring": "--lt-ring",
  "lt-danger": "--lt-danger",
  "lt-sm": "--lt-radius-sm",
};

describe("resolveTokens", () => {
  it("resolves utilities through variants and opacity modifiers", () => {
    const classes = [
      "inline-flex bg-lt-primary text-lt-primary-fg hover:bg-lt-primary/90 rounded-lt-sm",
      "focus-visible:ring-lt-ring/50 aria-invalid:border-lt-danger",
      "md:text-sm gap-2 ring-[3px]",
    ];
    expect(resolveTokens(classes, SUFFIX_MAP).sort()).toEqual(
      ["--lt-danger", "--lt-primary", "--lt-primary-fg", "--lt-radius-sm", "--lt-ring"].sort(),
    );
  });

  it("returns nothing when no lattice utilities are present", () => {
    expect(resolveTokens(["flex h-9 px-3 shadow-xs"], SUFFIX_MAP)).toEqual([]);
  });
});

describe("tokenLabel", () => {
  it("derives a human label, expanding known abbreviations", () => {
    expect(tokenLabel("--lt-primary-fg")).toBe("Primary foreground");
    expect(tokenLabel("--lt-bg")).toBe("Background");
    expect(tokenLabel("--lt-radius-sm")).toBe("Radius small");
  });
});

describe("collectClassNames", () => {
  it("collects the class attribute from every descendant element", () => {
    const root = document.createElement("div");
    root.innerHTML =
      '<button class="bg-lt-primary"><span class="text-lt-primary-fg">x</span></button>' +
      "<input>";
    expect(collectClassNames(root)).toEqual(["bg-lt-primary", "text-lt-primary-fg"]);
  });
});
