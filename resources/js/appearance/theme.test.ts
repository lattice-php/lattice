import { describe, expect, it } from "vitest";
import { createTheme } from "./theme";

function block(css: string, selector: string): string {
  const start = css.indexOf(selector);
  const open = css.indexOf("{", start);
  return css.slice(open + 1, css.indexOf("}", open));
}

describe("createTheme", () => {
  it("reproduces the default look for an empty theme", () => {
    const css = createTheme();
    const root = block(css, ":root");
    const dark = block(css, ".dark");
    expect(root).toContain("--primary:oklch(0.48 0.092 182)");
    expect(root).toContain("--primary-foreground:oklch(0.985 0 0)");
    expect(root).toContain("--primary-hover:oklch(0.43 0.092 182)");
    expect(root).toContain("--radius:0.5rem");
    expect(dark).toContain("--primary:oklch(0.74 0.105 182)");
  });

  it("derives foreground and states for an overridden brand color", () => {
    const root = block(createTheme({ colors: { primary: "oklch(0.55 0.2 265)" } }), ":root");
    expect(root).toContain("--primary:oklch(0.55 0.2 265)");
    expect(root).toContain("--primary-foreground:oklch(0.985 0 0)");
    expect(root).toContain("--primary-hover:oklch(0.5 0.2 265)");
    expect(root).toContain("--primary-active:oklch(0.46 0.2 265)");
  });

  it("derives a dark foreground when the brand color is light", () => {
    const root = block(createTheme({ colors: { primary: "oklch(0.9 0.05 100)" } }), ":root");
    expect(root).toContain("--primary-foreground:oklch(0.205 0 0)");
  });

  it("respects an explicit foreground override", () => {
    const root = block(
      createTheme({ colors: { primary: "oklch(0.55 0.2 265)", primaryFg: "oklch(1 0 0)" } }),
      ":root",
    );
    expect(root).toContain("--primary-foreground:oklch(1 0 0)");
  });

  it("brands dark mode only when a dark override is given", () => {
    const dark = block(
      createTheme({
        colors: { primary: "oklch(0.55 0.2 265)" },
        dark: { colors: { primary: "oklch(0.7 0.18 265)" } },
      }),
      ".dark",
    );
    expect(dark).toContain("--primary:oklch(0.7 0.18 265)");
    expect(dark).toContain("--primary-hover:oklch(0.75 0.18 265)");
  });

  it("emits scalar tokens", () => {
    const root = block(
      createTheme({ radius: "0.75rem", fontSans: "'Geist', sans-serif" }),
      ":root",
    );
    expect(root).toContain("--radius:0.75rem");
    expect(root).toContain("--font-sans:'Geist', sans-serif");
  });
});
