import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Guards the contract between internal `<Icon name="…">` usages and the SVGs
// Lattice ships in `icons/`, plus any icon dir a package declares via
// `extra.lattice.icons` in its composer.json. A typo'd or unshipped name fails
// here rather than rendering a blank glyph at runtime.
const repoRoot = resolve(import.meta.dirname, "../../../../..");
const packagesRoot = join(repoRoot, "packages");
const iconsDir = join(repoRoot, "packages/ui/resources/icons");

function svgBasenames(dir: string): string[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith(".svg"))
    .map((file) => file.replace(/\.svg$/, ""));
}

function packageIconNames(): string[] {
  return readdirSync(packagesRoot, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory()) {
      return [];
    }

    const packageDir = join(packagesRoot, entry.name);
    const composerJsonPath = join(packageDir, "composer.json");

    try {
      const composerJson = JSON.parse(readFileSync(composerJsonPath, "utf8"));
      const icons = composerJson.extra?.lattice?.icons;

      if (typeof icons !== "string") {
        return [];
      }

      return svgBasenames(join(packageDir, icons));
    } catch {
      return [];
    }
  });
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file))
    .map((file) => join(dir, file));
}

describe("sprite contract", () => {
  const shipped = new Set([...svgBasenames(iconsDir), ...packageIconNames()]);

  it("ships an SVG for every icon name internal components reference", () => {
    const referenced = new Set<string>();

    for (const file of sourceFiles(packagesRoot)) {
      const source = readFileSync(file, "utf8");

      for (const match of source.matchAll(/<Icon\s+name="([a-z0-9-]+)"/g)) {
        referenced.add(match[1]!);
      }

      // The rich-editor toolbar resolves names dynamically via `<Icon name={item.icon} />`,
      // so validate the literal names from its config too.
      if (file.endsWith("rich-editor.tsx")) {
        for (const match of source.matchAll(/icon: "([a-z][a-z0-9-]*)"/g)) {
          referenced.add(match[1]!);
        }
      }
    }

    // The sort indicator picks its name at runtime; assert both ends explicitly.
    referenced.add("arrow-up");
    referenced.add("arrow-down");

    const missing = [...referenced].filter((name) => !shipped.has(name)).sort();
    expect(missing).toEqual([]);
  });
});
