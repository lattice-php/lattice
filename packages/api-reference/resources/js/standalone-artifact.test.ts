import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

const hostExternals = ["react", "react-dom", "react/jsx-runtime", "@lattice-php/lattice/runtime"];

it("dist-standalone/plugin.js only imports the standalone host externals", () => {
  const artifact = readFileSync(
    path.resolve(import.meta.dirname, "../../dist-standalone/plugin.js"),
    "utf8",
  );
  const specifiers = [...artifact.matchAll(/^import\b[^"'\n]*(["'])([^"'\n]+)\1/gm)].map(
    (match) => match[2],
  );

  expect(specifiers.length).toBeGreaterThan(0);
  expect(artifact).not.toContain("import(");
  expect(artifact).not.toContain("process.env");

  for (const specifier of specifiers) {
    expect(hostExternals).toContain(specifier);
  }
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
