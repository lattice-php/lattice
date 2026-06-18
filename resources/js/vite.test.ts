import { readFileSync } from "node:fs";
import path from "node:path";
import { searchForWorkspaceRoot } from "vite";
import type { Plugin } from "vite";
import { describe, expect, it } from "vitest";
import { lattice, latticeConfig } from "./vite";

type PackageJson = {
  exports: Record<string, unknown>;
};

type ResolveIdFn = (
  this: { resolve: (id: string, importer?: string, options?: unknown) => Promise<unknown> },
  id: string,
) => Promise<string | null>;

type LoadFn = (id: string) => string | null;

function optionalPeersPlugin(): Plugin {
  const plugin = (lattice({ icons: false }) as Plugin[]).find(
    (candidate) => candidate?.name === "lattice:optional-peers",
  );

  if (!plugin) {
    throw new Error("optional-peers plugin not registered");
  }

  return plugin;
}

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

  it("stubs an absent optional Echo peer so consumers can still build", async () => {
    const plugin = optionalPeersPlugin();
    const resolveId = plugin.resolveId as unknown as ResolveIdFn;
    const load = plugin.load as unknown as LoadFn;

    const stubId = await resolveId.call({ resolve: async () => null }, "@laravel/echo-react");

    expect(stubId).toBe("\0lattice-optional-peer/@laravel/echo-react");

    const code = load(stubId as string);

    expect(code).toContain("export const useEcho =");
    expect(code).toContain("export const useEchoPublic =");
    expect(code).toContain("export const useEchoPresence =");
  });

  it("defers to the real package when the optional Echo peer is installed", async () => {
    const plugin = optionalPeersPlugin();
    const resolveId = plugin.resolveId as unknown as ResolveIdFn;
    const load = plugin.load as unknown as LoadFn;

    const resolved = await resolveId.call(
      { resolve: async () => ({ id: "/node_modules/@laravel/echo-react/index.js" }) },
      "@laravel/echo-react",
    );

    expect(resolved).toBeNull();
    expect(await resolveId.call({ resolve: async () => null }, "react")).toBeNull();
    expect(load("react")).toBeNull();
  });

  it("keeps package exports explicit and internal test helpers private", () => {
    const packageJson = JSON.parse(
      readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"),
    ) as PackageJson;

    expect(packageJson.exports).not.toHaveProperty("./*");
    expect(packageJson.exports).not.toHaveProperty("./test-support");
  });
});
