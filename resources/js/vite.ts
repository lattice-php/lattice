import path from "node:path";
import { svgSprite } from "@lattice-php/vite-svg-sprite";
import type { SvgSpriteOptions } from "@lattice-php/vite-svg-sprite";
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
  dts?: SvgSpriteOptions["dts"] | false;
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
  const plugins: PluginOption[] = [corePlugin(options)];
  const iconOptions = resolveIconOptions(options);

  if (iconOptions) {
    plugins.push(svgSprite(iconOptions));
  }

  return plugins;
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

function resolveIconOptions(options: LatticeViteOptions): SvgSpriteOptions | null {
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
    ...(dts === false ? {} : { dts: dts ?? defaultTypes }),
  };
}

function resolveRoots(options: LatticeViteOptions): Roots {
  const appRoot = options.appRoot ?? process.cwd();
  const root = options.root ?? path.resolve(appRoot, "vendor/lattice-php/lattice");

  return { appRoot, root };
}
