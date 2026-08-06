import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
});

it("serves the seeded appearance to server renders and ignores unknown values", async () => {
  const { seedAppearance, useAppearance } = await import(".");
  const { renderToString } = await import("react-dom/server");

  function Probe() {
    return <span>{useAppearance().appearance}</span>;
  }

  expect(renderToString(<Probe />)).toContain("system");

  seedAppearance("dark");

  expect(renderToString(<Probe />)).toContain("dark");

  seedAppearance("sepia");

  expect(renderToString(<Probe />)).toContain("dark");
});
