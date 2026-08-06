import { readFileSync } from "node:fs";
import path from "node:path";
import { esmExternalRequirePlugin } from "vite";
import type { Plugin, UserConfig } from "vite";

const runtimeSpecifier = "@lattice-php/lattice/runtime";
const redirectedModuleId = "\0lattice:runtime-redirect";

/**
 * The standalone host only maps `react`, `react/jsx-runtime`, and the runtime
 * barrel in its import map, so every other lattice (and Inertia) specifier a
 * plugin uses must resolve through the runtime barrel's re-exports.
 */
function redirectToRuntime(): Plugin {
  return {
    name: "lattice:standalone-runtime-redirect",
    enforce: "pre",
    resolveId(id) {
      if (id === runtimeSpecifier) {
        return { id, external: true };
      }

      if (id.startsWith("@lattice-php/") || id === "@inertiajs/react") {
        return redirectedModuleId;
      }

      return null;
    },
    load(id) {
      return id === redirectedModuleId
        ? `export * from ${JSON.stringify(runtimeSpecifier)};`
        : null;
    },
  };
}

function manifest(version: string): Plugin {
  return {
    name: "lattice:standalone-plugin-manifest",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: `${JSON.stringify({ version }, null, 2)}\n`,
      });
    },
  };
}

export function standalonePluginConfig(packageRoot: string): UserConfig {
  const { version } = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8")) as {
    version: string;
  };

  return {
    plugins: [
      redirectToRuntime(),
      // Owns the externals (never also in rollupOptions.external — the plugin
      // skips those) and rewrites `require("react")` in bundled CJS
      // dependencies (use-sync-external-store) into imports of the external.
      esmExternalRequirePlugin({
        external: ["react", "react-dom", "react/jsx-runtime", runtimeSpecifier],
      }),
      manifest(version),
    ],
    // Lib mode skips vite's default NODE_ENV substitution; bundled dependencies
    // referencing process.env would throw in the browser.
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      lib: {
        entry: path.join(packageRoot, "resources/js/plugin.ts"),
        formats: ["es"],
        fileName: () => "plugin.js",
      },
      rollupOptions: {
        output: {
          codeSplitting: false,
        },
      },
    },
  };
}
