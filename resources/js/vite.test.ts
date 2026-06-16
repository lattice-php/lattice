import { readFileSync } from "node:fs";
import path from "node:path";
import { searchForWorkspaceRoot } from "vite";
import { describe, expect, it } from "vitest";
import { latticeConfig } from "./vite";

type PackageJson = {
  exports: Record<string, unknown>;
};

describe("lattice Vite helper", () => {
  it("configures package-link mode without reading an environment variable", () => {
    const appRoot = path.resolve("/tmp/lattice-app");

    expect(latticeConfig({ appRoot })).toMatchObject({
      resolve: {
        alias: {
          react: path.resolve(appRoot, "node_modules/react"),
          "react-dom": path.resolve(appRoot, "node_modules/react-dom"),
        },
        dedupe: ["@inertiajs/react", "react", "react-dom"],
      },
      test: {
        server: {
          deps: {
            inline: [
              "@lattice-php/lattice",
              /[/\\]lattice[/\\]dist[/\\]/,
              /[/\\]lattice[/\\]node_modules[/\\]@radix-ui[/\\]/,
              /[/\\]lattice[/\\]node_modules[/\\]@tiptap[/\\]/,
              /[/\\]lattice[/\\]node_modules[/\\]react-i18next[/\\]/,
            ],
          },
        },
      },
    });
  });

  it("configures source-link mode from an explicit option", () => {
    const appRoot = path.resolve("/tmp/lattice-app");
    const root = path.resolve(appRoot, "vendor/lattice-php/lattice");

    expect(latticeConfig({ appRoot, source: true })).toMatchObject({
      resolve: {
        alias: {
          "@lattice-php/lattice/css": path.resolve(root, "resources/css/lattice.css"),
          "@lattice-php/lattice": path.resolve(root, "resources/js"),
        },
        dedupe: ["@inertiajs/react", "react", "react-dom"],
      },
      server: {
        fs: {
          allow: [searchForWorkspaceRoot(appRoot), root],
        },
      },
    });
  });

  it("keeps package exports explicit and internal test helpers private", () => {
    const packageJson = JSON.parse(
      readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"),
    ) as PackageJson;

    expect(packageJson.exports).not.toHaveProperty("./*");
    expect(packageJson.exports).not.toHaveProperty("./test-support");
  });
});
