import path from "node:path";
import { expect, it } from "vitest";
import { expectStandaloneArtifact } from "@lattice-php/core/standalone-test-support";

it("dist/plugin.js only imports the standalone host externals", () => {
  expectStandaloneArtifact(path.resolve(import.meta.dirname, "../../dist/plugin.js"));
});

it(
  "dist/plugin.js exports the plugin object against the runtime barrel",
  { timeout: 30_000 },
  async () => {
    const { default: plugin } = (await import("../../dist/plugin.js")) as {
      default: { name: string; components: Record<string, unknown> };
    };

    expect(plugin.name).toBe("lattice/search");
    expect(Object.keys(plugin.components)).toEqual([
      "search.box",
      "search.categories",
      "search.input",
      "search.preview",
      "search.recent",
      "search.results",
    ]);
  },
);
