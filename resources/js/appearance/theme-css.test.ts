import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "resources/css/lattice.css"), "utf8");

describe("lattice.css tokens", () => {
  it.each([
    "--lt-font-mono",
    "--lt-font-display",
    "--lt-ring-width",
    "--lt-ring-offset",
    "--lt-border-width",
    "--lt-radius-lg",
    "--lt-radius-xl",
    "--lt-radius-full",
    "--lt-shadow-inner",
    "--lt-warning-fg",
    "--lt-chart-1",
    "--lt-chart-8",
    "--lt-tracking-wide",
  ])("defines %s", (token) => {
    expect(css).toContain(token);
  });

  it("does not hardcode the mono stack in prose", () => {
    const proseCode = css.slice(css.indexOf(".lattice-prose :where(code)"));
    expect(proseCode).toContain("var(--lt-font-mono)");
  });
});
