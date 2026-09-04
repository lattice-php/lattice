import path from "node:path";
import { expect, it } from "vitest";
import { expectStandaloneArtifact } from "@lattice-php/core/standalone-test-support";

it("dist/plugin.js bundles the map engine and only imports host externals", () => {
  const artifact = expectStandaloneArtifact(
    path.resolve(import.meta.dirname, "../../dist/plugin.js"),
  );

  expect(artifact).not.toContain('from"leaflet"');
});

it(
  "dist/plugin.js registers the component and both bundled providers",
  { timeout: 30_000 },
  async () => {
    const { default: plugin } = (await import("../../dist/plugin.js")) as {
      default: {
        name: string;
        components: Record<string, unknown>;
        extensions: Record<string, Record<string, unknown>>;
      };
    };

    expect(plugin.name).toBe("lattice/map");
    expect(Object.keys(plugin.components)).toEqual(["map"]);
    expect(Object.keys(plugin.extensions["map.providers"])).toEqual([
      "openstreetmap",
      "googlemaps",
    ]);
  },
);
