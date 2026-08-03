import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import formPlugin, { formComponents } from "./plugin";

const packageRoot = path.resolve(import.meta.dirname, "../..");
const repositoryRoot = path.resolve(packageRoot, "../..");
const sourceRoot = path.join(packageRoot, "resources/js");

describe("form npm package contract", () => {
  it("provides the default export expected by Composer plugin discovery", () => {
    expect(formPlugin).toBe(formComponents);
  });

  it("is independently installable above Core and UI", () => {
    const manifest = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      exports?: Record<string, unknown>;
      name: string;
      peerDependencies?: Record<string, string>;
    };
    const aggregate = JSON.parse(
      readFileSync(path.join(repositoryRoot, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
      version: string;
    };

    expect(manifest.name).toBe("@lattice-php/form");
    expect(manifest.dependencies?.["@lattice-php/core"]).toBe(aggregate.version);
    expect(manifest.dependencies?.["@lattice-php/ui"]).toBe(aggregate.version);
    expect(manifest.dependencies?.["@lattice-php/lattice"]).toBeUndefined();
    expect(manifest.peerDependencies?.["@lattice-php/lattice"]).toBeUndefined();
    expect(manifest.exports?.["./rich-editor"]).toBeDefined();
    expect(aggregate.dependencies?.["@lattice-php/form"]).toBe(aggregate.version);
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
