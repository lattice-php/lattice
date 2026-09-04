import path from "node:path";
import { expect, it } from "vitest";
import { expectStandaloneArtifact } from "@lattice-php/core/standalone-test-support";

it("dist-standalone/plugin.js only imports the standalone host externals", () => {
  expectStandaloneArtifact(path.resolve(import.meta.dirname, "../../dist-standalone/plugin.js"));
});

// Evaluating the bundle under gate load (vitest concurrent with composer
// check) can exceed the default 5s.
it(
  "dist-standalone/plugin.js exports the plugin object against the runtime barrel",
  { timeout: 30_000 },
  async () => {
    const { default: plugin } = (await import("../../dist-standalone/plugin.js")) as {
      default: { name: string; components: Record<string, unknown> };
    };

    expect(plugin.name).toBe("api-reference");
    expect(Object.keys(plugin.components)).toEqual(["api-reference"]);
  },
);
