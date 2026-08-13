import { codecovVitePlugin } from "@codecov/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "node:path";
import Sonda from "sonda/vite";
import { defineConfig } from "vite";

const sourceRoot = path.resolve(import.meta.dirname, "resources/js");

/**
 * Bundle bench: builds `resources/js/bench/entry.ts` the way a consumer app
 * would — production app build, tree-shaken and minified, with the package's
 * peer dependencies external — so the Sonda report measures the framework's
 * marginal bundle cost instead of the workbench app. Run via `npm run analyze`.
 */
export default defineConfig({
  plugins: [
    react(),
    Sonda({
      format: ["html", "json"],
      // Dashes, not dots — Sonda parses everything after the last dot as the
      // file extension and would strip it.
      filename: "bundle-report-framework",
      outputDir: path.resolve(import.meta.dirname, "../../docs/generated"),
      gzip: true,
      deep: true,
      open: false,
    }),
    ...(process.env.CODECOV_BUNDLE === "1"
      ? [
          codecovVitePlugin({
            enableBundleAnalysis: true,
            bundleName: "lattice-framework",
            oidc: {
              useGitHubOIDC: true,
            },
            dryRun: process.env.CODECOV_BUNDLE_DRY_RUN === "1",
            telemetry: false,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@lattice-php/action": path.resolve(import.meta.dirname, "../action/resources/js"),
      "@lattice-php/core": path.resolve(import.meta.dirname, "../core/resources/js"),
      "@lattice-php/form": path.resolve(import.meta.dirname, "../form/resources/js"),
      "@lattice-php/table": path.resolve(import.meta.dirname, "../table/resources/js"),
      "@lattice-php/ui": path.resolve(import.meta.dirname, "../ui/resources/js"),
      "@lattice-php/lattice": sourceRoot,
    },
  },
  build: {
    outDir: "dist-analyze",
    emptyOutDir: true,
    sourcemap: true,
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: path.join(sourceRoot, "bench/entry.ts"),
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^@inertiajs\//,
        /^@laravel\/echo-react($|\/)/,
        /^laravel-echo($|\/)/,
        /^pusher-js($|\/)/,
      ],
    },
  },
});
