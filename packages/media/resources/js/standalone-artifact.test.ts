import path from "node:path";
import { expect, it } from "vitest";
import { expectStandaloneArtifact } from "@lattice-php/core/standalone-test-support";

it("dist/plugin.js only imports the standalone host externals", () => {
  expectStandaloneArtifact(path.resolve(import.meta.dirname, "../../dist/plugin.js"));
});

// Importing the bundle evaluates ~240 KB including tiptap; under gate load
// (vitest concurrent with composer check) that can exceed the default 5s.
it(
  "dist/plugin.js exports the plugin object against the runtime barrel",
  { timeout: 30_000 },
  async () => {
    const { default: plugin } = (await import("../../dist/plugin.js")) as {
      default: { name: string; components: Record<string, unknown> };
    };

    expect(plugin.name).toBe("media");
    expect(Object.keys(plugin.components)).toEqual(["media.library", "field.media-picker"]);
  },
);
