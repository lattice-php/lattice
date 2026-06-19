import inertia from "@inertiajs/vite";
import { codecovVitePlugin } from "@codecov/vite-plugin";
import { svgSprite, writePhpEnum } from "@lattice-php/vite-svg-sprite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import laravel from "laravel-vite-plugin";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import Sonda from "sonda/vite";
import type { Plugin } from "vite";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

const sourceRoot = path.resolve(__dirname, "resources/js");

const isVitest = process.env.VITEST !== undefined;

// The lucide icons Lattice's built-in components rely on. The sprite plugin
// idempotently vendors these into resources/icons (committed) at build time, so
// consumers can point at vendor/lattice-php/lattice/resources/icons without
// installing lucide-static. Keep sorted and grouped by origin.
const latticeIcons = [
  // Server-driven defaults (names components emit / consumers commonly use)
  "arrow-down", "arrow-up", "check", "chevrons-up-down", "copy", "external-link",
  "eye-off", "layout-dashboard", "link", "more-horizontal", "pencil", "pencil-line",
  "send", "settings", "trash-2", "x",
  // Internal chrome
  "chevron-down", "chevron-right", "circle-alert", "circle-check", "circle-help", "circle-x",
  "eye", "filter", "info", "loader-2", "minus", "panel-left", "plus", "rotate-ccw", "search",
  // Rich-editor toolbar
  "align-center", "align-justify", "align-left", "align-right", "bold", "code",
  "columns-3", "heading-1", "heading-2", "heading-3", "highlighter", "italic",
  "list", "list-ordered", "quote", "rows-3", "smile", "strikethrough", "table", "underline",
];

function libraryEntries(): string[] {
  return readdirSync(sourceRoot, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.(ts|tsx)$/.test(file))
    // Exclude declaration files and type-level test files — *.test.ts, *.test-d.ts, *.d.ts — from the published bundle.
    .filter((file) => !/\.(test(-d)?|d)\.(ts|tsx)$/.test(file))
    .filter((file) => !file.startsWith("test/"))
    .filter((file) => file !== "test-support.ts")
    .map((file) => path.join(sourceRoot, file));
}

function stylesheet(): Plugin {
  return {
    name: "lattice:stylesheet",
    generateBundle() {
      const css = readFileSync(path.join(sourceRoot, "../css/lattice.css"), "utf8");

      this.emitFile({
        type: "asset",
        fileName: "lattice.css",
        // Ship the stylesheet with @source pointing at the package's compiled output,
        // so tailwind scans correctly for classes in built-in components.
        source: `@source "./**/*.js";\n\n${css}`,
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const isLibrary = mode === "lib";
  // Sonda analyses the real app bundle (the workbench build). Gated behind an
  // env flag so it only runs for `npm run analyze` / the docs build, writing an
  // interactive report + JSON the bundle-size docs page reads at build time.
  const isSonda = !isLibrary && process.env.SONDA === "1";
  const isCodecovBundle = !isLibrary && !isVitest && process.env.CODECOV_BUNDLE === "1";

  return {
    publicDir: isLibrary ? false : undefined,
    plugins: [
      ...(isVitest || isLibrary
        ? []
        : [
            // Lattice's lucide icons (vendored into resources/icons) + the
            // workbench's custom icons compile into one sprite.
            svgSprite({
              include: [
                { from: "lucide-static/icons", names: latticeIcons, outDir: "resources/icons" },
              ],
              iconDirs: ["workbench/resources/icons"],
              // Generate an importable IconName union + augment <Icon name>.
              dts: {
                file: "workbench/resources/js/sprite-icons.ts",
                augmentModule: "@lattice-php/lattice",
                augmentInterface: "KnownIcons",
              },
            }),
            // Ship a backed PHP enum of Lattice's own icons (scoped to its set,
            // not the workbench's extras) so consumers pick them type-safely.
            {
              name: "lattice:icon-enum",
              buildStart() {
                writePhpEnum([...latticeIcons].sort(), {
                  file: "src/Core/Enums/Icon.php",
                  namespace: "Lattice\\Lattice\\Core\\Enums",
                  enum: "Icon",
                });
              },
            },
            laravel({
              input: ["workbench/resources/css/app.css", "workbench/resources/js/app.tsx"],
              publicDirectory: "vendor/orchestra/testbench-core/laravel/public",
              buildDirectory: "build",
              refresh: ["workbench/resources/**", "workbench/routes/**", "resources/js/**"],
            }),
            inertia(),
          ]),
      react(),
      ...(isLibrary
        ? [
            dts({
              tsconfigPath: path.resolve(__dirname, "tsconfig.json"),
              include: ["resources/js"],
              copyDtsFiles: true,
              // Exclude test files and declaration sources from .d.ts generation.
              exclude: [
                "resources/js/**/*.test.*",
                "resources/js/**/*.test-d.*",
                "resources/js/test/**",
                "resources/js/test-support.ts",
              ],
              compilerOptions: { rootDir: sourceRoot },
              outDir: "dist",
            }),
            stylesheet(),
          ]
        : [tailwindcss()]),
      ...(isSonda
        ? [
            Sonda({
              format: ["html", "json"],
              filename: "bundle-report",
              outputDir: path.resolve(__dirname, "docs/generated"),
              gzip: true,
              deep: true,
              open: false,
            }),
          ]
        : []),
      ...(isCodecovBundle
        ? codecovVitePlugin({
            enableBundleAnalysis: true,
            bundleName: "lattice-workbench",
            oidc: {
              useGitHubOIDC: true,
            },
            dryRun: process.env.CODECOV_BUNDLE_DRY_RUN === "1",
            telemetry: false,
          })
        : []),
    ],
    resolve: {
      alias: {
        "@lattice-php/lattice": sourceRoot,
      },
    },
    ...(isLibrary
      ? {
          build: {
            outDir: "dist",
            emptyOutDir: true,
            minify: false,
            sourcemap: true,
            lib: {
              entry: libraryEntries(),
              formats: ["es"] as const,
            },
            rollupOptions: {
              external: [
                /^node:/,
                /^react($|\/)/,
                /^react-dom($|\/)/,
                /^@inertiajs\//,
                /^@lattice-php\/vite-svg-sprite($|\/)/,
                /^@radix-ui\//,
                /^@tiptap\//,
                /^clsx($|\/)/,
                /^class-variance-authority($|\/)/,
                /^input-otp($|\/)/,
                /^tailwind-merge($|\/)/,
                /^vite($|\/)/,
                /^@laravel\/echo-react($|\/)/,
                /^i18next($|\/)/,
                /^react-i18next($|\/)/,
                /^i18next-http-backend($|\/)/,
                /^recharts($|\/)/,
                /^use-sync-external-store($|\/)/,
              ],
              output: {
                preserveModules: true,
                preserveModulesRoot: "resources/js",
                entryFileNames: "[name].js",
              },
            },
          },
        }
      : { build: { sourcemap: true,  chunkSizeWarningLimit: 600 } }),
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: "jsdom",
            environment: "jsdom",
            include: ["resources/js/**/*.test.{ts,tsx}", "docs/**/*.test.{ts,tsx}"],
            exclude: ["resources/js/**/*.browser.test.{ts,tsx}"],
            setupFiles: ["resources/js/test/setup.ts"],
          },
        },
        {
          extends: true,
          test: {
            name: "browser",
            include: ["resources/js/**/*.browser.test.{ts,tsx}"],
            setupFiles: ["resources/js/test/browser-setup.ts"],
            browser: {
              enabled: true,
              provider: playwright(),
              headless: true,
              locators: {
                testIdAttribute: "data-test",
              },
              viewport: {
                width: 1280,
                height: 800,
              },
              instances: [{ browser: "chromium" }],
            },
          },
        },
      ],
      coverage: {
        provider: "v8",
        reportsDirectory: "coverage_vitest",
        reporter: ["text", "lcov"],
        include: ["resources/js/**/*.{ts,tsx}"],
        exclude: [
          "resources/js/**/*.d.ts",
          "resources/js/**/*.test.{ts,tsx}",
          "resources/js/**/*.test-d.{ts,tsx}",
          "resources/js/test/**",
          "resources/js/test-support.ts",
          "resources/js/types/**",
        ],
      },
    },
  };
});
