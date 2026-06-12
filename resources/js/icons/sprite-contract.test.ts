import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Guards the contract between internal `<Icon name="…">` usages and the SVGs
// Lattice ships in `icons/`. A typo'd or unshipped name fails here rather than
// rendering a blank glyph at runtime.
const repoRoot = process.cwd();
const jsRoot = join(repoRoot, "resources/js");
const iconsDir = join(repoRoot, "resources/icons");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file))
    .map((file) => join(dir, file));
}

describe("sprite contract", () => {
  const shipped = new Set(
    readdirSync(iconsDir)
      .filter((file) => file.endsWith(".svg"))
      .map((file) => file.replace(/\.svg$/, "")),
  );

  it("ships an SVG for every icon name internal components reference", () => {
    const referenced = new Set<string>();

    for (const file of sourceFiles(jsRoot)) {
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
