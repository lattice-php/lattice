import { readFileSync } from "node:fs";
import path from "node:path";
import { svgSprite } from "@lattice-php/vite-svg-sprite";
import type { IconTypesOptions, SvgSpriteOptions } from "@lattice-php/vite-svg-sprite";
import { searchForWorkspaceRoot } from "vite";
import type { Plugin, PluginOption, UserConfig } from "vite";

type InlineDependency = string | RegExp;

type ConfigWithTest = UserConfig & {
  test?: {
    server?: {
      deps?: {
        inline?: InlineDependency[];
      };
    };
  };
};

export type LatticeViteIconsOptions = Omit<SvgSpriteOptions, "dts" | "iconDirs"> & {
  dirs?: string[];
  dts?: Partial<IconTypesOptions> | false;
};

export type LatticeViteOptions = {
  appRoot?: string;
  icons?: boolean | LatticeViteIconsOptions;
  root?: string;
  source?: boolean;
};

type Roots = {
  appRoot: string;
  root: string;
};

export function lattice(options: LatticeViteOptions = {}): PluginOption[] {
  const { appRoot } = resolveRoots(options);
  const plugins: PluginOption[] = [
    corePlugin(options),
    optionalPeersPlugin(),
    componentPackagesPlugin(discoverComponentPackages(appRoot)),
  ];
  const iconOptions = resolveIconOptions(options);

  if (iconOptions) {
    plugins.push(svgSprite(iconOptions));
  }

  return plugins;
}

/** A Composer package that contributes a Lattice component plugin. */
export type LatticeComponentPackage = {
  name: string;
  /** Absolute path to the package's installed directory. */
  dir: string;
  /** Absolute path to the package's JS plugin entry (its `createPlugin(...)`). */
  plugin: string;
};

type InstalledPackage = {
  name: string;
  "install-path"?: string;
  extra?: { lattice?: { plugin?: string } };
};

type RootPackageJson = {
  name?: string;
  extra?: { lattice?: { plugin?: string } };
};

/**
 * Resolve every Composer package that declares `extra.lattice.plugin` into an
 * absolute plugin-entry path. `installPathsRelativeTo` is `vendor/composer` (the
 * dir `installed.json` records its `install-path`s against).
 */
export function collectComponentPackages(
  installed: { packages?: InstalledPackage[] } | InstalledPackage[],
  installPathsRelativeTo: string,
): LatticeComponentPackage[] {
  const packages = Array.isArray(installed) ? installed : (installed.packages ?? []);

  return packages.flatMap((pkg) => {
    const entry = pkg.extra?.lattice?.plugin;

    if (typeof entry !== "string") {
      return [];
    }

    const dir = path.resolve(installPathsRelativeTo, pkg["install-path"] ?? `../${pkg.name}`);

    return [{ name: pkg.name, dir, plugin: path.resolve(dir, entry) }];
  });
}

/**
 * Resolve the composer ROOT project's own `extra.lattice.plugin` — Composer
 * never lists the root package in `installed.json`, so a component package
 * declaring the plugin entry in its own composer.json would otherwise be
 * invisible to its own dev server (e.g. inside a testbench workbench, where
 * the package itself is the app root).
 */
export function collectRootComponentPackage(
  composerJson: RootPackageJson,
  appRoot: string,
): LatticeComponentPackage[] {
  const entry = composerJson.extra?.lattice?.plugin;

  if (typeof entry !== "string" || typeof composerJson.name !== "string") {
    return [];
  }

  return [{ name: composerJson.name, dir: appRoot, plugin: path.resolve(appRoot, entry) }];
}

/**
 * Read `<appRoot>/vendor/composer/installed.json` and `<appRoot>/composer.json`
 * and collect every component package they contribute.
 */
export function discoverComponentPackages(appRoot: string): LatticeComponentPackage[] {
  const composerDir = path.resolve(appRoot, "vendor/composer");

  let installed: LatticeComponentPackage[] = [];

  try {
    const raw = readFileSync(path.join(composerDir, "installed.json"), "utf8");
    installed = collectComponentPackages(JSON.parse(raw), composerDir);
  } catch {
    installed = [];
  }

  let root: LatticeComponentPackage[] = [];

  try {
    const raw = readFileSync(path.join(appRoot, "composer.json"), "utf8");
    root = collectRootComponentPackage(JSON.parse(raw), appRoot);
  } catch {
    root = [];
  }

  return [...installed, ...root];
}

const VIRTUAL_PLUGINS_ID = "virtual:lattice/plugins";
const RESOLVED_VIRTUAL_PLUGINS_ID = `\0${VIRTUAL_PLUGINS_ID}`;

/**
 * Exposes the discovered component packages as `virtual:lattice/plugins` — a
 * module whose default export is the array of their `createPlugin(...)` results,
 * ready for `extendRegistry(registry, ...plugins)`. Also grants Vite filesystem
 * access to each package dir so its source compiles from `vendor/` (or a symlink).
 */
export function componentPackagesPlugin(packages: LatticeComponentPackage[]): Plugin {
  return {
    name: "lattice:component-packages",
    config(config) {
      if (packages.length === 0) {
        return {};
      }

      const workspaceRoot = searchForWorkspaceRoot(config.root ?? process.cwd());

      return { server: { fs: { allow: [workspaceRoot, ...packages.map((pkg) => pkg.dir)] } } };
    },
    resolveId(id) {
      return id === VIRTUAL_PLUGINS_ID ? RESOLVED_VIRTUAL_PLUGINS_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_PLUGINS_ID) {
        return null;
      }

      const imports = packages
        .map((pkg, index) => `import p${index} from ${JSON.stringify(pkg.plugin)};`)
        .join("\n");
      const list = packages.map((_, index) => `p${index}`).join(", ");

      return `${imports}\nexport default [${list}];\n`;
    },
  };
}

export function latticeConfig(options: LatticeViteOptions = {}): ConfigWithTest {
  const { appRoot, root } = resolveRoots(options);

  return {
    resolve: {
      alias: options.source
        ? {
            "@lattice-php/lattice/css": path.resolve(root, "resources/css/lattice.css"),
            "@lattice-php/lattice": path.resolve(root, "resources/js"),
          }
        : {
            react: path.resolve(appRoot, "node_modules/react"),
            "react-dom": path.resolve(appRoot, "node_modules/react-dom"),
          },
      dedupe: ["@inertiajs/react", "react", "react-dom"],
    },
    server: options.source
      ? {
          fs: {
            allow: [searchForWorkspaceRoot(appRoot), root],
          },
        }
      : undefined,
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
  };
}

function corePlugin(options: LatticeViteOptions): Plugin {
  return {
    name: "lattice",
    config() {
      return latticeConfig(options);
    },
  };
}

const OPTIONAL_PEER_STUB_PREFIX = "\0lattice-optional-peer/";

/**
 * Real-time listeners statically import their optional Echo peers. A consumer
 * that never uses real-time should still build, so stub a missing peer with
 * hooks that throw — the `RealtimeListeners` error boundary then degrades
 * gracefully and warns to install the peer, exactly as when it is absent.
 */
const OPTIONAL_PEER_STUBS: Record<string, string> = {
  "@laravel/echo-react": [
    "const missing = () => {",
    "  throw new Error(",
    '    "[lattice] Real-time listeners require @laravel/echo-react. Install it and call configureEcho().",',
    "  );",
    "};",
    "export const useEcho = missing;",
    "export const useEchoPublic = missing;",
    "export const useEchoPresence = missing;",
    "export const useEchoNotification = missing;",
  ].join("\n"),
};

function optionalPeersPlugin(): Plugin {
  return {
    name: "lattice:optional-peers",
    enforce: "pre",
    async resolveId(id) {
      if (!Object.prototype.hasOwnProperty.call(OPTIONAL_PEER_STUBS, id)) {
        return null;
      }

      const installed = await this.resolve(id, undefined, { skipSelf: true });

      return installed ? null : `${OPTIONAL_PEER_STUB_PREFIX}${id}`;
    },
    load(id) {
      if (!id.startsWith(OPTIONAL_PEER_STUB_PREFIX)) {
        return null;
      }

      return OPTIONAL_PEER_STUBS[id.slice(OPTIONAL_PEER_STUB_PREFIX.length)] ?? null;
    },
  };
}

export function resolveIconOptions(options: LatticeViteOptions): SvgSpriteOptions | null {
  const icons = options.icons ?? true;

  if (icons === false) {
    return null;
  }

  const { root } = resolveRoots(options);
  const iconOptions = icons === true ? {} : icons;
  const { dirs = [], dts, ...spriteOptions } = iconOptions;
  const defaultTypes = {
    file: "resources/js/types/sprite-icons.ts",
    augmentModule: "@lattice-php/lattice",
    augmentInterface: "KnownIcons",
  };

  return {
    ...spriteOptions,
    iconDirs: [path.resolve(root, "resources/icons"), ...dirs],
    ...(dts === false ? {} : { dts: { ...defaultTypes, ...dts } }),
  };
}

function resolveRoots(options: LatticeViteOptions): Roots {
  const appRoot = options.appRoot ?? process.cwd();
  const root = options.root ?? path.resolve(appRoot, "vendor/lattice-php/lattice");

  return { appRoot, root };
}
