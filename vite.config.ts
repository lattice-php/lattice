import inertia from "@inertiajs/vite";
import { svgSprite, writePhpEnum } from "@lattice-php/vite-svg-sprite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import laravel from "laravel-vite-plugin";
import path from "node:path";
import {
  componentPackagesPlugin,
  discoverComponentPackages,
} from "./packages/framework/resources/js/vite.ts";
import { defineConfig } from "vitest/config";

const sourceRoot = path.resolve(import.meta.dirname, "packages/framework/resources/js");

const isVitest = process.env.VITEST !== undefined;

const componentPackages = discoverComponentPackages(import.meta.dirname);

// The lucide icons Lattice's built-in components rely on. The sprite plugin
// idempotently vendors these into packages/ui/resources/icons at build time, so
// consumers can use the icon set shipped by lattice-php/ui without
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

export default defineConfig({
  plugins: [
    ...(isVitest
      ? []
      : [
          // Lattice's lucide icons + the
          // workbench's custom icons compile into one sprite.
          svgSprite({
            include: [
              {
                from: "lucide-static/icons",
                names: latticeIcons,
                outDir: "packages/ui/resources/icons",
              },
            ],
            iconDirs: [
              ...componentPackages.flatMap((pkg) => (pkg.icons ? [pkg.icons] : [])),
              "packages/signature-example/resources/icons",
              "workbench/resources/icons",
            ],
            // Generate an importable IconName union + augment <Icon name>.
            dts: {
              file: "workbench/resources/js/sprite-icons.ts",
              augmentModule: "@lattice-php/ui",
              augmentInterface: "KnownIcons",
            },
          }),
          // Ship a backed PHP enum of Lattice's own icons (scoped to its set,
          // not the workbench's extras) so consumers pick them type-safely.
          {
            name: "lattice:icon-enum",
            buildStart() {
              writePhpEnum([...latticeIcons].sort(), {
                file: "packages/ui/src/Enums/Icon.php",
                namespace: "Lattice\\Ui\\Enums",
                enum: "Icon",
              });
            },
          },
          laravel({
            input: ["workbench/resources/css/app.css", "workbench/resources/js/app.tsx"],
            publicDirectory: "vendor/orchestra/testbench-core/laravel/public",
            buildDirectory: "build",
            refresh: [
              "workbench/resources/**",
              "workbench/routes/**",
              "packages/framework/resources/js/**",
            ],
          }),
          inertia({ ssr: "workbench/resources/js/ssr.tsx" }),
        ]),
    // The workbench acts as a Lattice consumer: auto-discover component
    // packages installed via Composer and expose them as
    // `virtual:lattice/plugins` (external apps get this from `lattice()`).
    componentPackagesPlugin(componentPackages),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@lattice-php/action": path.resolve(import.meta.dirname, "packages/action/resources/js"),
      "@lattice-php/api-reference/css": path.resolve(
        import.meta.dirname,
        "packages/api-reference/resources/css/api-reference.css",
      ),
      "@lattice-php/api-reference": path.resolve(
        import.meta.dirname,
        "packages/api-reference/resources/js",
      ),
      "@lattice-php/calendar/css": path.resolve(
        import.meta.dirname,
        "packages/calendar/resources/css/calendar.css",
      ),
      "@lattice-php/calendar": path.resolve(import.meta.dirname, "packages/calendar/resources/js"),
      "@lattice-php/tree": path.resolve(import.meta.dirname, "packages/tree/resources/js"),
      "@lattice-php/core": path.resolve(import.meta.dirname, "packages/core/resources/js"),
      "@lattice-php/form": path.resolve(import.meta.dirname, "packages/form/resources/js"),
      "@lattice-php/media": path.resolve(import.meta.dirname, "packages/media/resources/js"),
      "@lattice-php/search": path.resolve(import.meta.dirname, "packages/search/resources/js"),
      "@lattice-php/signature-example/css": path.resolve(
        import.meta.dirname,
        "packages/signature-example/resources/css/signature-example.css",
      ),
      "@lattice-php/table": path.resolve(import.meta.dirname, "packages/table/resources/js"),
      "@lattice-php/ui": path.resolve(import.meta.dirname, "packages/ui/resources/js"),
      "@lattice-php/lattice": sourceRoot,
    },
  },
  build: { sourcemap: true, chunkSizeWarningLimit: 600 },
  test: {
    unstubGlobals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "jsdom",
          environment: "jsdom",
          // Must exceed setup.ts's 10s asyncUtilTimeout or a slow-but-passing
          // findBy dies on the test timeout instead.
          testTimeout: 30_000,
          include: ["docs/**/*.test.{ts,tsx}", "packages/*/resources/js/**/*.test.{ts,tsx}"],
          // exclude replaces Vitest's defaults instead of extending them, and
          // docs/ links the repo root through file:.., so the docs glob walks
          // back into the whole tree unless node_modules is restored here.
          exclude: ["**/node_modules/**", "**/*.browser.test.{ts,tsx}"],
          setupFiles: ["packages/framework/resources/js/test/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["packages/*/resources/js/**/*.browser.test.{ts,tsx}"],
          setupFiles: ["packages/framework/resources/js/test/browser-setup.ts"],
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
      include: ["packages/*/resources/js/**/*.{ts,tsx}"],
      reporter: ["text", "lcov"],
      exclude: [
        "packages/*/resources/js/**/*.d.ts",
        "packages/*/resources/js/**/*.test.{ts,tsx}",
        "packages/*/resources/js/**/*.test-d.{ts,tsx}",
        "packages/*/resources/js/generated.ts",
        "packages/*/resources/js/test/**",
        "packages/*/resources/js/**/*test-support.{ts,tsx}",
        "packages/framework/resources/js/bench/**",
        "packages/framework/resources/js/types/**",
      ],
    },
  },
});
