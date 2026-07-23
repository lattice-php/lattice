import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createTheme, type Theme } from "./theme";

const inputs: Array<{ name: string; input: Theme }> = [
  { name: "empty", input: {} },
  { name: "oklch-brand", input: { colors: { primary: "oklch(0.55 0.2 265)" } } },
  { name: "hex-brand", input: { colors: { primary: "#6366f1" } } },
  { name: "rgb-brand", input: { colors: { primary: "rgb(99, 102, 241)" } } },
  { name: "explicit-fg", input: { colors: { primary: "#6366f1", primaryFg: "oklch(1 0 0)" } } },
  {
    name: "dark-override",
    input: { colors: { primary: "#6366f1" }, dark: { colors: { primary: "oklch(0.7 0.18 265)" } } },
  },
  { name: "scalars", input: { radius: "0.75rem", fontSans: "'Geist', sans-serif" } },
  { name: "light-surface-override", input: { colors: { surface: "#101010" } } },
  { name: "non-derivable-named", input: { colors: { primary: "rebeccapurple" } } },
  { name: "stateful-near-gray", input: { colors: { primary: "#808080" } } },
];

const path = resolve(process.cwd(), "resources/theme-fixtures.json");

if (process.env.UPDATE_THEME_FIXTURES) {
  const generated = inputs.map(({ name, input }) => ({ name, input, css: createTheme(input) }));
  writeFileSync(path, `${JSON.stringify(generated, null, 2)}\n`);
}

const fixtures = JSON.parse(readFileSync(path, "utf8")) as Array<{
  name: string;
  input: Theme;
  css: string;
}>;

describe("theme fixtures (JS reference)", () => {
  it.each(fixtures)("$name reproduces its committed css", ({ input, css }) => {
    expect(createTheme(input)).toBe(css);
  });
});
