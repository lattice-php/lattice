import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

const hostExternals = ["react", "react-dom", "react/jsx-runtime", "@lattice-php/lattice/runtime"];

it("dist/plugin.js bundles the map engine and only imports host externals", () => {
  const artifact = readFileSync(path.resolve(import.meta.dirname, "../../dist/plugin.js"), "utf8");
  const specifiers = [...artifact.matchAll(/^import\b[^"'\n]*(["'])([^"'\n]+)\1/gm)].map(
    (match) => match[2],
  );

  expect(specifiers.length).toBeGreaterThan(0);
  expect(artifact).not.toContain('from"leaflet"');
  expect(artifact).not.toContain("import(");
  expect(artifact).not.toContain("process.env");

  for (const specifier of specifiers) {
    expect(hostExternals).toContain(specifier);
  }
});

it(
  "dist/plugin.js registers the component and OpenStreetMap provider",
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
    expect(Object.keys(plugin.extensions["map.providers"])).toEqual(["openstreetmap"]);
  },
);
