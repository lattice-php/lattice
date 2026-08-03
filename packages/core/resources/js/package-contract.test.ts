import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const packageRoot = path.resolve(import.meta.dirname, "../..");
const sourceRoot = path.join(packageRoot, "resources/js");

describe("core npm package contract", () => {
  it("is independently installable", () => {
    const manifest = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      name: string;
      peerDependencies?: Record<string, string>;
    };

    expect(manifest.name).toBe("@lattice-php/core");
    expect(manifest.dependencies?.["@lattice-php/lattice"]).toBeUndefined();
    expect(manifest.peerDependencies?.["@lattice-php/lattice"]).toBeUndefined();
  });

  it("does not import the umbrella package", () => {
    const violations = readdirSync(sourceRoot, { encoding: "utf8", recursive: true })
      .filter((file) => /\.(ts|tsx)$/.test(file) && !/\.test(-d)?\.(ts|tsx)$/.test(file))
      .flatMap((file) => {
        const contents = readFileSync(path.join(sourceRoot, file), "utf8");

        return contents.includes("@lattice-php/lattice") ? [file] : [];
      });

    expect(violations).toEqual([]);
  });
});
