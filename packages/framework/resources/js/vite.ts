import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildSprite, svgSprite } from "@lattice-php/vite-svg-sprite";
import type { IconTypesOptions, Sprite, SvgSpriteOptions } from "@lattice-php/vite-svg-sprite";
import { searchForWorkspaceRoot } from "vite";
import type { Plugin, PluginOption, UserConfig } from "vite";
import { refreshTypeScriptTypes } from "./vite-typescript-refresh.ts";

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
  /** Refresh generated TypeScript types via the dev server. Defaults to `true`. */
  typescript?: boolean;
};

type Roots = {
  appRoot: string;
  root: string;
};

export function lattice(options: LatticeViteOptions = {}): PluginOption[] {
  const { appRoot, root } = resolveRoots(options);
  const packages = discoverComponentPackages(appRoot);
  const plugins: PluginOption[] = [
    corePlugin(options),
    optionalPeersPlugin(),
    componentPackagesPlugin(packages, appRoot, resolveUiCssPath(options, appRoot, root), {
      requireComposer: true,
    }),
    typescriptPlugin(options),
  ];
  const iconOptions = resolveIconOptions(options, packages);

  if (iconOptions) {
    plugins.push(svgSprite(iconOptions));
  }

  return plugins;
}

/**
 * Resolve the real, on-disk `@lattice-php/ui/css` file that
 * `componentPackagesPlugin` should wrap — source-link mode reads straight
 * from the sibling `ui` package the same way `latticeConfig`'s own alias
 * does; package-link mode reads the installed `@lattice-php/ui` package's
 * own `exports["./css"]` and joins it against that package's directory,
 * exactly what a plain `import "@lattice-php/ui/css"` would resolve to.
 * This is computed, not resolved through Node's module resolution: the
 * wrapper `@import`s this path but isn't read until Tailwind processes the
 * build, so the target only has to be correct here, not already built —
 * `require.resolve` would demand the (often not-yet-built) dist file exist
 * at config time and throw otherwise. Returns `undefined` (skipping the
 * wrapper) only when `@lattice-php/ui` itself isn't installed — an app that
 * hasn't run `npm install` yet degrades the same way `discoverComponentPackages`
 * used to for a missing `vendor/`.
 */
function resolveUiCssPath(
  options: LatticeViteOptions,
  appRoot: string,
  root: string,
): string | undefined {
  if (options.source) {
    return path.resolve(root, "../ui/resources/css/lattice.css");
  }

  const packageDir = resolveInstalledPackageDir(appRoot, "@lattice-php/ui");

  if (!packageDir) {
    return undefined;
  }

  try {
    const packageJson = JSON.parse(readFileSync(path.join(packageDir, "package.json"), "utf8"));
    const cssExport = packageJson.exports?.["./css"];
    const cssRelative = typeof cssExport === "string" ? cssExport : cssExport?.default;

    return typeof cssRelative === "string" ? path.resolve(packageDir, cssRelative) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Locate an installed npm package's directory by walking up from `startDir`
 * through each ancestor's `node_modules/<name>`, the same walk Node's own
 * module resolution does — stopping at the first one whose `package.json`
 * actually exists, without requiring anything the package exports to exist.
 */
function resolveInstalledPackageDir(startDir: string, name: string): string | undefined {
  let dir = startDir;

  for (;;) {
    const candidate = path.join(dir, "node_modules", name);

    if (existsSync(path.join(candidate, "package.json"))) {
      return candidate;
    }

    const parent = path.dirname(dir);

    if (parent === dir) {
      return undefined;
    }

    dir = parent;
  }
}

/** A Composer package that contributes a Lattice component plugin. */
export type LatticeComponentPackage = {
  name: string;
  /** Absolute path to the package's installed directory. */
  dir: string;
  /** Absolute path to the package's JS plugin entry. */
  plugin: string;
  /** Absolute path to the package's stylesheet, when it declares one. */
  css?: string;
  /** Absolute path to the package's icon directory, when it declares one. */
  icons?: string;
};

type LatticeManifest = { plugin?: string; css?: string; icons?: string };

type InstalledPackage = {
  name: string;
  "install-path"?: string;
  extra?: { lattice?: LatticeManifest };
};

type RootPackageJson = {
  name?: string;
  extra?: { lattice?: LatticeManifest };
};

function resolveManifestPaths(
  manifest: LatticeManifest,
  dir: string,
): Pick<LatticeComponentPackage, "css" | "icons"> {
  return {
    ...(typeof manifest.css === "string" ? { css: path.resolve(dir, manifest.css) } : {}),
    ...(typeof manifest.icons === "string" ? { icons: path.resolve(dir, manifest.icons) } : {}),
  };
}

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
    const manifest = pkg.extra?.lattice ?? {};
    const entry = manifest.plugin;

    if (typeof entry !== "string") {
      return [];
    }

    const dir = path.resolve(installPathsRelativeTo, pkg["install-path"] ?? `../${pkg.name}`);

    return [
      {
        name: pkg.name,
        dir,
        plugin: path.resolve(dir, entry),
        ...resolveManifestPaths(manifest, dir),
      },
    ];
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
  const manifest = composerJson.extra?.lattice ?? {};

  if (typeof manifest.plugin !== "string" || typeof composerJson.name !== "string") {
    return [];
  }

  return [
    {
      name: composerJson.name,
      dir: appRoot,
      plugin: path.resolve(appRoot, manifest.plugin),
      ...resolveManifestPaths(manifest, appRoot),
    },
  ];
}

/**
 * Read `<appRoot>/vendor/composer/installed.json` and `<appRoot>/composer.json`
 * and collect every component package they contribute.
 */
export function discoverComponentPackages(appRoot: string): LatticeComponentPackage[] {
  const composerDir = path.resolve(appRoot, "vendor/composer");
  const installedJsonPath = path.join(composerDir, "installed.json");

  let installed: LatticeComponentPackage[] = [];

  try {
    const raw = readFileSync(installedJsonPath, "utf8");
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
const VIRTUAL_CSS_ID = "virtual:lattice/css";
const RESOLVED_VIRTUAL_CSS_ID = `\0${VIRTUAL_CSS_ID}`;
const GENERATED_CSS_RELATIVE_PATH = "node_modules/.lattice/component-packages.css";
const GENERATED_WRAPPER_CSS_RELATIVE_PATH = "node_modules/.lattice/lattice.css";

/**
 * An `@import` of every discovered package's own stylesheet, followed by a
 * Tailwind `@source` per package so its component TSX is scanned for
 * utility classes. `@import` must precede every other rule in a stylesheet —
 * interleaving `@source`/`@import` per package instead silently drops every
 * import that comes after the first `@source`.
 */
function componentPackagesCss(packages: LatticeComponentPackage[]): string {
  const imports = packages.flatMap((pkg) =>
    pkg.css ? [`@import ${JSON.stringify(pkg.css)};`] : [],
  );
  const sources = packages.map((pkg) => `@source ${JSON.stringify(path.dirname(pkg.plugin))};`);

  return [...imports, ...sources].join("\n");
}

/**
 * Exposes the discovered component packages as `virtual:lattice/plugins` — a
 * module whose default export is the array of their plugin objects,
 * ready for `extendRegistry(registry, ...plugins)`. Also grants Vite filesystem
 * access to each package dir so its source compiles from `vendor/` (or a symlink).
 *
 * Also wires the stylesheet counterpart: `@lattice-php/lattice/css` and
 * `@lattice-php/ui/css` normally resolve straight to the published, static
 * `lattice.css` — which must stay self-contained, since plenty of consumers
 * (the docs site, the standalone bundle, a package building itself) import it
 * without this plugin at all. When `uiCssPath` is given (the app actually
 * uses this plugin), both specifiers are instead aliased to a generated
 * wrapper — `@import` of the real stylesheet plus every discovered package's
 * `@source`/`@import` — so a consumer's existing single import picks up every
 * package with no per-package import of their own. `virtual:lattice/css`
 * exposes just the package-only half the same way, for anyone composing their
 * own wrapper. Tailwind's `@import` resolver reads the resolved file straight
 * off disk — it never calls back into a Vite plugin's `load` — so neither can
 * serve generated content directly; both are aliased to real files instead,
 * generated into `node_modules/.lattice/` in `buildStart`, and Vite's own
 * resolver (which Tailwind delegates to for `@import`) follows the alias to
 * them like any other file.
 */
export function componentPackagesPlugin(
  packages: LatticeComponentPackage[],
  appRoot?: string,
  uiCssPath?: string,
  options: { requireComposer?: boolean } = {},
): Plugin {
  const installedJsonPath = appRoot
    ? path.resolve(appRoot, "vendor/composer/installed.json")
    : undefined;
  let generatedCssPath = "";
  let generatedWrapperCssPath = "";

  return {
    name: "lattice:component-packages",
    config(config) {
      const workspaceRoot = searchForWorkspaceRoot(config?.root ?? process.cwd());

      generatedCssPath = path.resolve(workspaceRoot, GENERATED_CSS_RELATIVE_PATH);

      // Vite's mergeAlias puts plugin-config aliases in front of the user config's,
      // so this specific `/css` alias wins over a user's broader package-dir alias.
      // Among plugins, a later plugin's alias wins on a key collision — this
      // plugin runs after `corePlugin` in `lattice()`, so it wins over
      // `latticeConfig`'s source-mode `@lattice-php/*/css` aliases too.
      const alias: Record<string, string> = {
        [VIRTUAL_CSS_ID]: generatedCssPath,
        ...(uiCssPath
          ? (() => {
              generatedWrapperCssPath = path.resolve(
                workspaceRoot,
                GENERATED_WRAPPER_CSS_RELATIVE_PATH,
              );

              return {
                "@lattice-php/lattice/css": generatedWrapperCssPath,
                "@lattice-php/ui/css": generatedWrapperCssPath,
              };
            })()
          : {}),
        ...Object.fromEntries(
          packages.flatMap((pkg) => (pkg.css ? [[`@${pkg.name}/css`, pkg.css]] : [])),
        ),
      };

      return {
        resolve: { alias },
        server: { fs: { allow: [workspaceRoot, ...packages.map((pkg) => pkg.dir)] } },
      };
    },
    buildStart() {
      if (generatedCssPath) {
        mkdirSync(path.dirname(generatedCssPath), { recursive: true });
        writeFileSync(generatedCssPath, componentPackagesCss(packages));
      }

      if (generatedWrapperCssPath && uiCssPath) {
        mkdirSync(path.dirname(generatedWrapperCssPath), { recursive: true });
        writeFileSync(
          generatedWrapperCssPath,
          [`@import ${JSON.stringify(uiCssPath)};`, componentPackagesCss(packages)].join("\n"),
        );
      }
    },
    configResolved(config) {
      // A consumer building for production without its Composer dependencies
      // would otherwise silently ship no component package at all. Only the
      // build command is gated: this package's own tests spin up dev/SSR
      // servers through `lattice()` with no vendor/ on purpose.
      if (
        options.requireComposer &&
        installedJsonPath &&
        config.command === "build" &&
        !existsSync(installedJsonPath)
      ) {
        throw new Error(
          `Lattice couldn't find ${installedJsonPath}. Run \`composer install\` before building.`,
        );
      }
    },
    configureServer(server) {
      if (!installedJsonPath) {
        return;
      }

      // A composer change can add or remove a component package, which this
      // plugin only discovers at startup — restart so it re-runs discovery
      // instead of silently continuing to serve the stale set.
      server.watcher.add(installedJsonPath);
      server.watcher.on("change", (file) => {
        if (file === installedJsonPath) {
          server.restart();
        }
      });
    },
    resolveId(id) {
      if (id === VIRTUAL_PLUGINS_ID) {
        return RESOLVED_VIRTUAL_PLUGINS_ID;
      }

      if (id === VIRTUAL_CSS_ID) {
        return RESOLVED_VIRTUAL_CSS_ID;
      }

      return null;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_CSS_ID) {
        return componentPackagesCss(packages);
      }

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
      // A react alias would break SSR: Vite only externalizes bare specifiers,
      // so an absolute path inlines react's CJS into the SSR module runner.
      // `dedupe` alone keeps the app on a single React copy, symlinks included.
      ...(options.source
        ? {
            alias: {
              "@lattice-php/lattice/css": path.resolve(root, "../ui/resources/css/lattice.css"),
              "@lattice-php/lattice": path.resolve(root, "resources/js"),
              "@lattice-php/action": path.resolve(root, "../action/resources/js"),
              "@lattice-php/core": path.resolve(root, "../core/resources/js"),
              "@lattice-php/form": path.resolve(root, "../form/resources/js"),
              "@lattice-php/table": path.resolve(root, "../table/resources/js"),
              "@lattice-php/ui/css": path.resolve(root, "../ui/resources/css/lattice.css"),
              "@lattice-php/ui": path.resolve(root, "../ui/resources/js"),
            },
          }
        : {}),
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

/**
 * Refreshes `node.props` typings from the app's own `php artisan
 * lattice:typescript` whenever the dev server starts — installing or updating
 * a component package would otherwise leave its generated types stale until
 * someone remembers to run the command by hand. Dev-server only: a production
 * build machine may not have PHP installed, and the generated file is a dev
 * ergonomics artifact, not a build input.
 *
 * Module-private like its siblings `optionalPeersPlugin`/`corePlugin` — the
 * `refreshTypeScriptTypes` DI seam it defers to lives in
 * `./vite-typescript-refresh`, which isn't part of the published `vite`
 * subpath either (see that module for why).
 */
function typescriptPlugin(options: LatticeViteOptions): Plugin {
  return {
    name: "lattice:typescript",
    apply: "serve",
    configureServer(server) {
      const typescript = options.typescript ?? true;

      if (typescript === false) {
        return;
      }

      const { appRoot } = resolveRoots(options);

      refreshTypeScriptTypes(appRoot, server.config.logger);
    },
  };
}

export function resolveIconOptions(
  options: LatticeViteOptions,
  packages: LatticeComponentPackage[] = [],
): SvgSpriteOptions | null {
  const icons = options.icons ?? true;

  if (icons === false) {
    return null;
  }

  const { root } = resolveRoots(options);
  const iconOptions = icons === true ? {} : icons;
  const { dirs = [], dts, ...spriteOptions } = iconOptions;
  const defaultTypes = {
    file: "resources/js/types/sprite-icons.ts",
    augmentModule: "@lattice-php/ui",
    augmentInterface: "KnownIcons",
  };

  return {
    ...spriteOptions,
    iconDirs: [
      path.resolve(root, "../ui/resources/icons"),
      ...packages.flatMap((pkg) => (pkg.icons ? [pkg.icons] : [])),
      ...dirs,
    ],
    ...(dts === false ? {} : { dts: { ...defaultTypes, ...dts } }),
  };
}

/**
 * Builds the same icon sprite the `lattice()` Vite plugin serves, outside of
 * Vite: ui's icon set, every discovered component package's icons, and the
 * app's own `icons.dirs`. The result is a `SpriteValue` for `SpriteProvider`
 * (`href: ""` inlines the markup), which is what a Storybook, a design-system
 * export, a prerender script, or a test needs to render `Icon` without a
 * dev server or an emitted asset.
 */
export function buildLatticeSprite(options: LatticeViteOptions = {}): Sprite & { href: "" } {
  const { appRoot } = resolveRoots(options);
  const iconOptions = resolveIconOptions(options, discoverComponentPackages(appRoot));

  if (!iconOptions) {
    return { href: "", ids: [], source: "" };
  }

  const { iconDirs = [], symbolId, svgoConfig } = iconOptions;

  return { href: "", ...buildSprite(iconDirs, { symbolId, svgoConfig }) };
}

function resolveRoots(options: LatticeViteOptions): Roots {
  const appRoot = options.appRoot ?? process.cwd();
  const root = options.root ?? path.resolve(appRoot, "vendor/lattice-php/lattice");

  return { appRoot, root };
}
