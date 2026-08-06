import path from "node:path";

/**
 * Source aliases for every workspace package, so each package's vitest config
 * (and any future tooling) resolves siblings identically without repeating the
 * map. Unused aliases are inert.
 */
export const workspaceAliases: Record<string, string> = {
  "@lattice-php/action": path.resolve(import.meta.dirname, "action/resources/js"),
  "@lattice-php/core": path.resolve(import.meta.dirname, "core/resources/js"),
  "@lattice-php/form": path.resolve(import.meta.dirname, "form/resources/js"),
  "@lattice-php/lattice": path.resolve(import.meta.dirname, "framework/resources/js"),
  "@lattice-php/table": path.resolve(import.meta.dirname, "table/resources/js"),
  "@lattice-php/tree": path.resolve(import.meta.dirname, "tree/resources/js"),
  "@lattice-php/ui": path.resolve(import.meta.dirname, "ui/resources/js"),
};
