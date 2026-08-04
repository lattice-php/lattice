import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const packageRoot = path.resolve(import.meta.dirname, "../..");
const repositoryRoot = path.resolve(packageRoot, "../..");
const sourceRoot = path.join(packageRoot, "resources/js");

describe("ui npm package contract", () => {
  it("is independently installable above Core", () => {
    const manifest = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      name: string;
      peerDependencies?: Record<string, string>;
    };
    const aggregate = JSON.parse(
      readFileSync(path.join(repositoryRoot, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
      version: string;
    };

    expect(manifest.name).toBe("@lattice-php/ui");
    expect(manifest.dependencies?.["@lattice-php/core"]).toBe(aggregate.version);
    expect(manifest.dependencies?.["@lattice-php/lattice"]).toBeUndefined();
    expect(manifest.peerDependencies?.["@lattice-php/lattice"]).toBeUndefined();
    expect(aggregate.dependencies?.["@lattice-php/ui"]).toBe(aggregate.version);
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

  it("owns the shared stylesheet", () => {
    const manifest = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8")) as {
      exports?: Record<string, unknown>;
    };

    const css = readFileSync(path.join(packageRoot, "resources/css/lattice.css"), "utf8");

    expect(css).not.toBe("");
    expect(manifest.exports).toHaveProperty("./css");
    expect(manifest.exports).toHaveProperty(["./i18n", "import"], "./dist/i18n/index.js");
    expect(manifest.exports).toHaveProperty(["./icons", "import"], "./dist/icons/index.js");
  });
});
