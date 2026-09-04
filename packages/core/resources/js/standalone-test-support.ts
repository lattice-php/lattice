import { readFileSync } from "node:fs";
import { expect } from "vitest";

/**
 * The only specifiers a standalone plugin bundle may leave unbundled. A host
 * page supplies these on `window`; anything else must be inside the artifact
 * or it fails to resolve at runtime.
 */
export const standaloneHostExternals = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "@lattice-php/lattice/runtime",
];

/**
 * Assert a built standalone bundle imports nothing but the host externals and
 * carries no build-time `process.env`, then hand the source back so a package
 * can add its own guards (an SDK that must stay bundled, a version pin).
 *
 * `dynamicImport` opts out of the no-`import(` check for the two bundles that
 * legitimately contain one.
 */
export function expectStandaloneArtifact(
  bundlePath: string,
  { dynamicImport = false }: { dynamicImport?: boolean } = {},
): string {
  const artifact = readFileSync(bundlePath, "utf8");
  const specifiers = [...artifact.matchAll(/^import\b[^"'\n]*(["'])([^"'\n]+)\1/gm)].map(
    (match) => match[2],
  );

  expect(specifiers.length).toBeGreaterThan(0);
  expect(artifact).not.toContain("process.env");

  if (!dynamicImport) {
    expect(artifact).not.toContain("import(");
  }

  for (const specifier of specifiers) {
    expect(standaloneHostExternals).toContain(specifier);
  }

  return artifact;
}
