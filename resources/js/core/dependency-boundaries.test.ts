import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const coreRoot = path.resolve(process.cwd(), "resources/js/core");
const packageImport = /["'](@lattice-php\/lattice(?:\/[^"']*)?)["']/g;
const allowedPackageImport =
  /^@lattice-php\/lattice\/(?:core(?:\/.*)?|i18n\/locale|lib\/.*|types\/generated)$/;

describe("core dependency boundary", () => {
  it("does not import feature or ui domains", () => {
    const violations = readdirSync(coreRoot, { encoding: "utf8", recursive: true })
      .filter((file) => /\.(ts|tsx)$/.test(file) && !/\.test(-d)?\.(ts|tsx)$/.test(file))
      .flatMap((file) =>
        [...readFileSync(path.join(coreRoot, file), "utf8").matchAll(packageImport)]
          .map((match) => match[1])
          .filter((specifier) => !allowedPackageImport.test(specifier))
          .map((specifier) => `${file}: ${specifier}`),
      );

    expect(violations).toEqual([]);
  });
});
