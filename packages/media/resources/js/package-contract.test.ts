import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import mediaPlugin from "./plugin";

describe("media package", () => {
  it("registers through core without importing the aggregate package", () => {
    const sourceRoot = path.resolve(import.meta.dirname);
    const production = readdirSync(sourceRoot, { recursive: true, encoding: "utf8" })
      .filter((file) => /\.(ts|tsx)$/.test(file))
      .filter((file) => !/\.(test(-d)?|d)\.(ts|tsx)$/.test(file))
      .filter((file) => !/test-(setup|support)\.(ts|tsx)$/.test(file))
      .map((file) => readFileSync(path.join(sourceRoot, file), "utf8"))
      .join("\n");

    expect(mediaPlugin.name).toBe("media");
    expect(production).not.toContain("@lattice-php/lattice");
  });
});
