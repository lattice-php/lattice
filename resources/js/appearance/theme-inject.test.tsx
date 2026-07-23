import { afterEach, expect, it } from "vitest";
import { injectTheme } from "./theme";

afterEach(() => {
  document.getElementById("lattice-theme")?.remove();
});

it("injects a single managed style element", () => {
  injectTheme({ colors: { primary: "oklch(0.55 0.2 265)" } });
  const style = document.getElementById("lattice-theme");
  expect(style).not.toBeNull();
  expect(style?.textContent).toContain("--primary:oklch(0.55 0.2 265)");
});

it("replaces content on re-injection instead of appending", () => {
  injectTheme({ colors: { primary: "oklch(0.55 0.2 265)" } });
  injectTheme({ colors: { primary: "oklch(0.6 0.2 30)" } });
  expect(document.querySelectorAll("#lattice-theme")).toHaveLength(1);
  expect(document.getElementById("lattice-theme")?.textContent).toContain(
    "--primary:oklch(0.6 0.2 30)",
  );
});
