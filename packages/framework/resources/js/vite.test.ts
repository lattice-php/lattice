import path from "node:path";
import { searchForWorkspaceRoot } from "vite";
import type { Logger, Plugin } from "vite";
import { describe, expect, it, vi } from "vitest";
import {
  collectComponentPackages,
  collectRootComponentPackage,
  componentPackagesPlugin,
  discoverComponentPackages,
  lattice,
  latticeConfig,
  resolveIconOptions,
} from "./vite";
import * as typescriptRefresh from "./vite-typescript-refresh";

type FakeLogger = Pick<Logger, "info" | "warn">;
type FakeServer = { config: { logger: FakeLogger } };

function fakeLogger(): FakeLogger {
  return { info: vi.fn(), warn: vi.fn() };
}

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

function typescriptPlugin(options: Parameters<typeof lattice>[0] = {}): Plugin {
  const plugin = (lattice({ icons: false, ...options }) as Plugin[]).find(
    (candidate) => candidate?.name === "lattice:typescript",
  );

  if (!plugin) {
    throw new Error("typescript plugin not registered");
  }

  return plugin;
}

describe("lattice Vite helper", () => {
  it("configures package-link mode by default with dedupe and inlined test deps", () => {
    const appRoot = path.resolve("/tmp/lattice-app");
    const config = latticeConfig({ appRoot });

    expect(config).toMatchObject({
      resolve: {
        dedupe: ["@inertiajs/react", "react", "react-dom"],
      },
      test: {
        server: {
          deps: {
            inline: [
              "@lattice-php/lattice",
              "@lattice-php/action",
              "@lattice-php/core",
              "@lattice-php/form",
              "@lattice-php/table",
              "@lattice-php/ui",
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
          "@lattice-php/lattice/css": path.resolve(root, "../ui/resources/css/lattice.css"),
          "@lattice-php/lattice": path.resolve(root, "resources/js"),
          "@lattice-php/ui/css": path.resolve(root, "../ui/resources/css/lattice.css"),
          "@lattice-php/ui": path.resolve(root, "../ui/resources/js"),
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
    expect(code).toContain("export const useEchoNotification =");
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

  it("resolves the app root's own composer.json as a component package", () => {
    const appRoot = path.resolve("/tmp/app");

    expect(
      collectRootComponentPackage(
        { name: "acme/signature", extra: { lattice: { plugin: "resources/js/plugin.ts" } } },
        appRoot,
      ),
    ).toEqual([
      {
        name: "acme/signature",
        dir: appRoot,
        plugin: path.resolve(appRoot, "resources/js/plugin.ts"),
      },
    ]);
  });

  it("ignores the app root's composer.json when it declares no plugin entry", () => {
    const appRoot = path.resolve("/tmp/app");

    expect(collectRootComponentPackage({ name: "acme/plain" }, appRoot)).toEqual([]);
    expect(
      collectRootComponentPackage(
        { extra: { lattice: { plugin: "resources/js/plugin.ts" } } },
        appRoot,
      ),
    ).toEqual([]);
  });

  it("resolves css and icons manifest paths for component packages", () => {
    const composerDir = path.resolve("/tmp/app/vendor/composer");

    const packages = collectComponentPackages(
      {
        packages: [
          {
            name: "acme/signature",
            "install-path": "../acme/signature",
            extra: {
              lattice: {
                plugin: "resources/js/plugin.ts",
                css: "resources/css/signature.css",
                icons: "resources/icons",
              },
            },
          },
          {
            name: "acme/no-plugin",
            "install-path": "../acme/no-plugin",
            extra: { lattice: { css: "resources/css/ignored.css" } },
          },
        ],
      },
      composerDir,
    );

    expect(packages).toEqual([
      {
        name: "acme/signature",
        dir: path.resolve("/tmp/app/vendor/acme/signature"),
        plugin: path.resolve("/tmp/app/vendor/acme/signature/resources/js/plugin.ts"),
        css: path.resolve("/tmp/app/vendor/acme/signature/resources/css/signature.css"),
        icons: path.resolve("/tmp/app/vendor/acme/signature/resources/icons"),
      },
    ]);
  });

  it("resolves css and icons for the composer ROOT package", () => {
    const appRoot = path.resolve("/tmp/app");

    expect(
      collectRootComponentPackage(
        {
          name: "acme/signature",
          extra: {
            lattice: {
              plugin: "resources/js/plugin.ts",
              css: "resources/css/signature.css",
              icons: "resources/icons",
            },
          },
        },
        appRoot,
      ),
    ).toEqual([
      {
        name: "acme/signature",
        dir: appRoot,
        plugin: path.resolve(appRoot, "resources/js/plugin.ts"),
        css: path.resolve(appRoot, "resources/css/signature.css"),
        icons: path.resolve(appRoot, "resources/icons"),
      },
    ]);
  });

  it("discovers a component package that is its own composer ROOT project", () => {
    const appRoot = path.resolve("tests/Fixtures/PackageDiscovery/root-package");

    expect(discoverComponentPackages(appRoot)).toEqual([
      {
        name: "acme/root-widget",
        dir: appRoot,
        plugin: path.resolve(appRoot, "resources/js/plugin.ts"),
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
    expect(config({}).server.fs.allow).toEqual([
      searchForWorkspaceRoot(process.cwd()),
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

  it("aliases @vendor/name/css for discovered packages that ship a stylesheet", () => {
    const plugin = componentPackagesPlugin([
      {
        name: "acme/signature",
        dir: "/app/vendor/acme/signature",
        plugin: "/app/vendor/acme/signature/resources/js/plugin.ts",
        css: "/app/vendor/acme/signature/resources/css/signature.css",
      },
      {
        name: "acme/widget",
        dir: "/app/vendor/acme/widget",
        plugin: "/app/vendor/acme/widget/resources/js/plugin.ts",
      },
    ]);
    const config = plugin.config as unknown as (c?: { root?: string }) => {
      resolve?: { alias?: Record<string, string> };
    };

    expect(config({ root: "/app" }).resolve?.alias).toEqual({
      "@acme/signature/css": "/app/vendor/acme/signature/resources/css/signature.css",
    });
  });

  it("does not refresh when the typescript option is false", () => {
    const refresh = vi
      .spyOn(typescriptRefresh, "refreshTypeScriptTypes")
      .mockImplementation(() => {});
    const configureServer = typescriptPlugin({
      appRoot: path.resolve("/tmp/lattice-app"),
      typescript: false,
    }).configureServer as unknown as (server: FakeServer) => void;

    configureServer({ config: { logger: fakeLogger() } });

    expect(refresh).not.toHaveBeenCalled();

    refresh.mockRestore();
  });

  it("merges a partial dts override over the default file/augment targets", () => {
    const appRoot = path.resolve("/tmp/lattice-app");

    const iconOptions = resolveIconOptions({
      appRoot,
      icons: { dts: { augmentInterface: "MyIcons" } },
    });

    expect(iconOptions?.dts).toEqual({
      file: "resources/js/types/sprite-icons.ts",
      augmentModule: "@lattice-php/ui",
      augmentInterface: "MyIcons",
    });
  });

  it("orders icon dirs ui, then discovered packages, then app dirs", () => {
    const appRoot = path.resolve("/tmp/lattice-app");
    const root = path.resolve(appRoot, "vendor/lattice-php/lattice");

    const iconOptions = resolveIconOptions({ appRoot, icons: { dirs: ["/app/icons"] } }, [
      {
        name: "acme/signature",
        dir: "/app/vendor/acme/signature",
        plugin: "/app/vendor/acme/signature/resources/js/plugin.ts",
        icons: "/app/vendor/acme/signature/resources/icons",
      },
      {
        name: "acme/widget",
        dir: "/app/vendor/acme/widget",
        plugin: "/app/vendor/acme/widget/resources/js/plugin.ts",
      },
    ]);

    expect(iconOptions?.iconDirs).toEqual([
      path.resolve(root, "../ui/resources/icons"),
      "/app/vendor/acme/signature/resources/icons",
      "/app/icons",
    ]);
  });
});
