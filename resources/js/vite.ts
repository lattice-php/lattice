import path from "node:path";
import { searchForWorkspaceRoot } from "vite";
import type { Plugin, UserConfig } from "vite";

type InlineDependency = string | RegExp;

type LatticeUserConfig = UserConfig & {
  test?: {
    server?: {
      deps?: {
        inline?: InlineDependency[];
      };
    };
  };
};

export type LatticeViteOptions = {
  appRoot?: string;
  root?: string;
  source?: boolean;
};

export function lattice(options: LatticeViteOptions = {}): Plugin {
  return {
    name: "lattice",
    config() {
      return latticeConfig(options);
    },
  };
}

export function latticeConfig(options: LatticeViteOptions = {}): LatticeUserConfig {
  const appRoot = options.appRoot ?? process.cwd();
  const root = options.root ?? path.resolve(appRoot, "vendor/lattice-php/lattice");

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
          inline: ["@lattice-php/lattice", /[/\\]lattice[/\\]dist[/\\]/],
        },
      },
    },
  };
}
