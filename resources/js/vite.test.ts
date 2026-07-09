import { readFileSync } from "node:fs";
import path from "node:path";
import { searchForWorkspaceRoot } from "vite";
import type { Plugin } from "vite";
import { describe, expect, it } from "vitest";
import {
  collectComponentPackages,
  componentPackagesPlugin,
  discoverComponentPackages,
  lattice,
  latticeConfig,
} from "./vite";

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

  it("resolves plugin entries only for packages that declare extra.lattice.plugin", () => {
    const composerDir = path.resolve("/tmp/app/vendor/composer");

    const packages = collectComponentPackages(
      {
        packages: [
          {
            name: "acme/signature",
            "install-path": "../acme/signature",
            extra: { lattice: { plugin: "resources/js/plugin.ts" } },
          },
          { name: "acme/plain", "install-path": "../acme/plain" },
        ],
      },
      composerDir,
    );

    expect(packages).toEqual([
      {
        name: "acme/signature",
        dir: path.resolve("/tmp/app/vendor/acme/signature"),
        plugin: path.resolve("/tmp/app/vendor/acme/signature/resources/js/plugin.ts"),
      },
    ]);
  });

  it("exposes the discovered plugins as the virtual:lattice/plugins module", () => {
    const plugin = componentPackagesPlugin([
      {
        name: "acme/signature",
        dir: "/app/vendor/acme/signature",
        plugin: "/app/vendor/acme/signature/resources/js/plugin.ts",
      },
    ]);
    const resolveId = plugin.resolveId as unknown as (id: string) => string | null;
    const load = plugin.load as unknown as (id: string) => string | null;
    const config = plugin.config as unknown as (c?: { root?: string }) => {
      server: { fs: { allow: string[] } };
    };

    const resolved = resolveId("virtual:lattice/plugins");

    expect(resolved).toBe("\0virtual:lattice/plugins");

    const code = load(resolved as string) ?? "";

    expect(code).toContain('import p0 from "/app/vendor/acme/signature/resources/js/plugin.ts";');
    expect(code).toContain("export default [p0];");
    // The workspace root must stay in the allow list: specifying server.fs.allow at all
    // replaces Vite's default root allowance, so the app's own files 403 without it.
    expect(config({ root: "/app" }).server.fs.allow).toEqual([
      searchForWorkspaceRoot("/app"),
      "/app/vendor/acme/signature",
    ]);
  });

  it("degrades to an empty plugin list when nothing is discoverable", () => {
    expect(discoverComponentPackages(path.resolve("/tmp/lattice-missing"))).toEqual([]);

    const plugin = componentPackagesPlugin([]);
    const load = plugin.load as unknown as (id: string) => string | null;
    const config = plugin.config as unknown as () => unknown;

    expect(load("\0virtual:lattice/plugins")).toContain("export default [];");
    expect(config()).toEqual({});
  });

  it("keeps package exports explicit and internal test helpers private", () => {
    const packageJson = JSON.parse(
      readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"),
    ) as PackageJson;

    expect(packageJson.exports).not.toHaveProperty("./*");
    expect(packageJson.exports).not.toHaveProperty("./test-support");
  });
});
