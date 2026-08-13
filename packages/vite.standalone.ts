import { codecovVitePlugin } from "@codecov/vite-plugin";
import { readFileSync } from "node:fs";
import path from "node:path";
import Sonda from "sonda/vite";
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

export function standalonePluginConfig(
  packageRoot: string,
  options: { outDir?: string } = {},
): UserConfig {
  const { version } = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8")) as {
    version: string;
  };
  const target = path.basename(packageRoot);
  // `npm run analyze` re-runs the standalone builds with SONDA=1 to measure
  // each package's marginal bundle cost (the standalone artifact externalizes
  // react and the lattice runtime, so exactly the package's own code plus its
  // unique dependencies remain). The analyze run needs sourcemaps and must not
  // touch the committed dist artifacts, so it writes to dist-analyze instead.
  const isAnalyze = process.env.SONDA === "1";

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
      ...(isAnalyze
        ? [
            Sonda({
              format: ["html", "json"],
              // Dashes, not dots — Sonda parses everything after the last
              // dot as the file extension and would strip it.
              filename: `bundle-report-${target}`,
              outputDir: path.resolve(packageRoot, "../../docs/generated"),
              gzip: true,
              deep: true,
              open: false,
            }),
          ]
        : []),
      ...(process.env.CODECOV_BUNDLE === "1"
        ? [
            codecovVitePlugin({
              enableBundleAnalysis: true,
              bundleName: `lattice-${target}`,
              oidc: {
                useGitHubOIDC: true,
              },
              dryRun: process.env.CODECOV_BUNDLE_DRY_RUN === "1",
              telemetry: false,
            }),
          ]
        : []),
    ],
    // Lib mode skips vite's default NODE_ENV substitution; bundled dependencies
    // referencing process.env would throw in the browser.
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    build: {
      outDir: isAnalyze ? "dist-analyze" : (options.outDir ?? "dist"),
      emptyOutDir: true,
      sourcemap: isAnalyze,
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
