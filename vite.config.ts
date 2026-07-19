import inertia from "@inertiajs/vite";
import { codecovVitePlugin } from "@codecov/vite-plugin";
import { buildSprite, svgSprite, writePhpEnum } from "@lattice-php/vite-svg-sprite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import laravel from "laravel-vite-plugin";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import Sonda from "sonda/vite";
import type { Plugin } from "vite";
import { componentPackagesPlugin, discoverComponentPackages } from "./resources/js/vite";
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
  "arrow-down",
  "arrow-up",
  "check",
  "chevrons-up-down",
  "copy",
  "external-link",
  "eye-off",
  "layout-dashboard",
  "link",
  "more-horizontal",
  "pencil",
  "pencil-line",
  "send",
  "settings",
  "trash-2",
  "x",
  // Internal chrome
  "bell",
  "calendar",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "circle-alert",
  "circle-check",
  "circle-help",
  "circle-x",
  "clock",
  "eye",
  "filter",
  "info",
  "loader-2",
  "minus",
  "panel-left",
  "plus",
  "rotate-ccw",
  "search",
  // Rich-editor toolbar
  "align-center",
  "align-justify",
  "align-left",
  "align-right",
  "bold",
  "code",
  "code-xml",
  "columns-3",
  "heading",
  "heading-1",
  "heading-2",
  "heading-3",
  "highlighter",
  "italic",
  "list",
  "list-ordered",
  "quote",
  "rows-3",
  "smile",
  "strikethrough",
  "table",
  "underline",
];

function libraryEntries(): string[] {
  return (
    readdirSync(sourceRoot, { recursive: true, encoding: "utf8" })
      .filter((file) => /\.(ts|tsx)$/.test(file))
      .filter((file) => !/\.(test(-d)?|d)\.(ts|tsx)$/.test(file))
      .filter((file) => !file.startsWith("test/"))
      .filter((file) => file !== "test-support.ts")
      // Type-only sources compile to empty chunks; they ship as .d.ts via the
      // dts plugin and are exposed through types-only export conditions.
      .filter((file) => !file.startsWith("types/"))
      .filter((file) => !file.startsWith("standalone/"))
      .map((file) => path.join(sourceRoot, file))
  );
}

/**
 * TypeScript's node16/nodenext resolution requires explicit runtime extensions
 * on relative imports. Sources use bundler-style extensionless specifiers, so
 * the emitted declarations must be rewritten to stay resolvable outside
 * bundlers (verified by `attw` in check:package).
 */
function withExplicitExtensions(filePath: string, content: string): string {
  const sourceDir = path.join(
    sourceRoot,
    path.relative(path.resolve(__dirname, "dist"), path.dirname(filePath)),
  );
  const existsAsModule = (base: string): boolean =>
    ["ts", "tsx"].some((extension) => existsSync(`${base}.${extension}`));

  return content.replace(
    /(\b(?:from|import)\s*\(?\s*)(["'])(\.\.?(?:\/[^"']+)?)\2/g,
    (match, prefix: string, quote: string, specifier: string) => {
      const target = path.join(sourceDir, specifier);

      if (existsAsModule(target)) {
        return `${prefix}${quote}${specifier}.js${quote}`;
      }

      if (existsAsModule(path.join(target, "index"))) {
        return `${prefix}${quote}${specifier}/index.js${quote}`;
      }

      return match;
    },
  );
}

function standaloneSprite(): Plugin {
  return {
    name: "lattice:standalone-sprite",
    generateBundle() {
      const sprite = buildSprite([path.resolve(__dirname, "resources/icons")]);

      this.emitFile({ type: "asset", fileName: "sprite.svg", source: sprite.source });
    },
  };
}

function standaloneManifest(): Plugin {
  return {
    name: "lattice:standalone-manifest",
    generateBundle(_options, bundle) {
      const { version } = JSON.parse(
        readFileSync(path.resolve(__dirname, "package.json"), "utf8"),
      ) as {
        version: string;
      };
      const files: Record<string, string> = {};

      for (const [fileName, output] of Object.entries(bundle)) {
        const source = output.type === "chunk" ? output.code : output.source;

        files[fileName] = createHash("sha256").update(source).digest("hex").slice(0, 12);
      }

      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: `${JSON.stringify({ version, files }, null, 2)}\n`,
      });
    },
  };
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
  const isStandalone = mode === "standalone";
  // Sonda analyses the real app bundle (the workbench build). Gated behind an
  // env flag so it only runs for `npm run analyze` / the docs build, writing an
  // interactive report + JSON the bundle-size docs page reads at build time.
  const isSonda = !isLibrary && process.env.SONDA === "1";
  const isCodecovBundle = !isLibrary && !isVitest && process.env.CODECOV_BUNDLE === "1";

  return {
    publicDir: isLibrary || isStandalone ? false : undefined,
    plugins: [
      ...(isVitest || isLibrary || isStandalone
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
                  file: "src/Ui/Enums/Icon.php",
                  namespace: "Lattice\\Lattice\\Ui\\Enums",
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
            // The workbench acts as a Lattice consumer: auto-discover component
            // packages installed via Composer and expose them as
            // `virtual:lattice/plugins` (external apps get this from `lattice()`).
            componentPackagesPlugin(discoverComponentPackages(__dirname)),
          ]),
      react(),
      ...(isLibrary
        ? [
            dts({
              tsconfigPath: path.resolve(__dirname, "tsconfig.json"),
              include: ["resources/js"],
              copyDtsFiles: true,
              exclude: [
                "resources/js/**/*.test.*",
                "resources/js/**/*.test-d.*",
                "resources/js/test/**",
                "resources/js/test-support.ts",
                "resources/js/standalone/**",
              ],
              compilerOptions: { rootDir: sourceRoot },
              outDir: "dist",
              beforeWriteFile: (filePath, content) => ({
                filePath,
                content: withExplicitExtensions(filePath, content),
              }),
            }),
            stylesheet(),
          ]
        : [tailwindcss()]),
      ...(isStandalone ? [standaloneSprite(), standaloneManifest()] : []),
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
    ...(isStandalone
      ? {
          base: "./",
          build: {
            outDir: "dist-standalone",
            emptyOutDir: true,
            sourcemap: false,
            cssCodeSplit: false,
            rollupOptions: {
              input: { lattice: path.resolve(sourceRoot, "standalone/main.tsx") },
              output: {
                entryFileNames: "[name].js",
                chunkFileNames: "chunks/[name]-[hash].js",
                assetFileNames: (info) =>
                  info.names.some((name) => name.endsWith(".css"))
                    ? "lattice.css"
                    : "assets/[name]-[hash][extname]",
              },
            },
          },
        }
      : isLibrary
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
                  /^@internationalized\/date($|\/)/,
                  /^@lattice-php\/vite-svg-sprite($|\/)/,
                  /^@radix-ui\//,
                  /^@tiptap\//,
                  /^@zag-js\//,
                  /^clsx($|\/)/,
                  /^class-variance-authority($|\/)/,
                  /^input-otp($|\/)/,
                  /^react-colorful($|\/)/,
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
        : { build: { sourcemap: true, chunkSizeWarningLimit: 600 } }),
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
        thresholds: {
          statements: 95,
          branches: 87,
          functions: 93,
          lines: 95,
        },
      },
    },
  };
});
