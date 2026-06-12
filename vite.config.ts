import inertia from "@inertiajs/vite";
import { svgSprite } from "@lattice-php/vite-svg-sprite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

const sourceRoot = path.resolve(__dirname, "resources/js");

const isVitest = process.env.VITEST !== undefined;

function libraryEntries(): string[] {
  return readdirSync(sourceRoot, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.(ts|tsx)$/.test(file))
    // Exclude declaration files and type-level test files — *.test.ts, *.test-d.ts, *.d.ts — from the published bundle.
    .filter((file) => !/\.(test(-d)?|d)\.(ts|tsx)$/.test(file))
    .filter((file) => !file.startsWith("test/"))
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

  return {
    publicDir: isLibrary ? false : undefined,
    plugins: [
      ...(isVitest || isLibrary
        ? []
        : [
            // Lattice's own icons + the workbench's custom icons compile into one sprite.
            svgSprite({ iconDirs: ["resources/icons", "workbench/resources/icons"] }),
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
              // Exclude test files and declaration sources from .d.ts generation.
              exclude: ["resources/js/**/*.test.*", "resources/js/**/*.test-d.*", "resources/js/test/**"],
              compilerOptions: { rootDir: sourceRoot },
              outDir: "dist",
            }),
            stylesheet(),
          ]
        : [tailwindcss()]),
    ],
    resolve: {
      alias: {
        "@lattice/lattice": sourceRoot,
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
                /^react($|\/)/,
                /^react-dom($|\/)/,
                /^@inertiajs\//,
                /^@radix-ui\//,
                /^@tiptap\//,
                /^clsx($|\/)/,
                /^class-variance-authority($|\/)/,
                /^tailwind-merge($|\/)/,
              ],
              output: {
                preserveModules: true,
                preserveModulesRoot: "resources/js",
                entryFileNames: "[name].js",
              },
            },
          },
        }
      : {}),
    test: {
      environment: "jsdom",
      include: ["resources/js/**/*.test.{ts,tsx}", "docs/**/*.test.{ts,tsx}"],
      setupFiles: ["resources/js/test/setup.ts"],
    },
  };
});
