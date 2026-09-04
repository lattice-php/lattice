import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";
import { expectStandaloneArtifact } from "@lattice-php/core/standalone-test-support";

const distDir = path.resolve(import.meta.dirname, "../../dist");

it("dist/plugin.js bundles the pdf engine and only imports host externals", () => {
  // pdf.js legitimately keeps two `import(` occurrences: the runtime-expression
  // fake-worker fallback and a CDN-wrapper template string.
  const artifact = expectStandaloneArtifact(path.join(distDir, "plugin.js"), {
    dynamicImport: true,
  });

  expect(artifact).not.toContain('from"pdfjs-dist"');

  // getTextContent() iterates a ReadableStream with `for await`, which Safari
  // cannot do — the engine must stay on the manual reader in text-cache.ts.
  expect(artifact).not.toContain(".getTextContent(");

  // A literal specifier after `import(` would mean a code-splitting leak.
  expect(artifact).not.toMatch(/import\(\s*["'](?!\$\{)/);
  expect(artifact.match(/import\(/g)).toHaveLength(2);
});

it("ships a worker artifact matching the pinned pdfjs-dist version", () => {
  const worker = readFileSync(path.join(distDir, "pdf.worker.min.mjs"), "utf8");
  const { dependencies } = JSON.parse(
    readFileSync(path.resolve(import.meta.dirname, "../../package.json"), "utf8"),
  ) as { dependencies: Record<string, string> };
  const pinned = dependencies["pdfjs-dist"];

  expect(pinned).toMatch(/^\d+\.\d+\.\d+$/);
  expect(worker).toContain(`"${pinned}"`);

  const artifact = readFileSync(path.join(distDir, "plugin.js"), "utf8");
  expect(artifact).toContain(`"${pinned}"`);
});

it("dist/plugin.js registers the component and the pdf engine", { timeout: 30_000 }, async () => {
  const { default: plugin } = (await import("../../dist/plugin.js")) as {
    default: {
      name: string;
      components: Record<string, unknown>;
      extensions: Record<string, Record<string, unknown>>;
    };
  };

  expect(plugin.name).toBe("lattice/pdf");
  expect(Object.keys(plugin.components)).toEqual(["pdf"]);
  expect(Object.keys(plugin.extensions["pdf.engine"] ?? {})).toEqual(["engine"]);
});
