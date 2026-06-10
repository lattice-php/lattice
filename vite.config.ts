import inertia from "@inertiajs/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

const sourceRoot = path.resolve(__dirname, "resources/js");
const distRoot = path.resolve(__dirname, "dist");

const isVitest = process.env.VITEST !== undefined;

function libraryEntries(): string[] {
  return readdirSync(sourceRoot, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.(ts|tsx)$/.test(file))
    .filter((file) => !/\.(test|d)\.(ts|tsx)$/.test(file))
    .filter((file) => !file.startsWith("test/"))
    .map((file) => path.join(sourceRoot, file));
}

// vite-plugin-dts keys its output off the project root (the shared tsconfig also
// covers the workbench), so declarations land under dist/resources/js. Lift them
// up so each .d.ts sits next to its compiled .js.
function liftDeclarations(): void {
  const nested = path.join(distRoot, "resources/js");

  if (!existsSync(nested)) {
    return;
  }

  for (const entry of readdirSync(nested, { recursive: true, encoding: "utf8" })) {
    const from = path.join(nested, entry);

    if (statSync(from).isDirectory()) {
      continue;
    }

    const to = path.join(distRoot, entry);
    mkdirSync(path.dirname(to), { recursive: true });
    renameSync(from, to);
  }

  rmSync(path.join(distRoot, "resources"), { recursive: true, force: true });
}

// Guardrail: the heaviest lazily-registered component (TipTap) must keep its own
// dynamically-imported chunk so consumers only load it on demand.
function assertChunksSplit(): void {
  const formIndex = readFileSync(path.join(distRoot, "form/index.js"), "utf8");
  if (
    !existsSync(path.join(distRoot, "form/components/fields/rich-editor.js")) ||
    !/import\([^)]*rich-editor/.test(formIndex)
  ) {
    throw new Error("Library build flattened the rich-editor chunk — code-splitting is broken.");
  }
}

// Ship the stylesheet with its @source pointing at the compiled output so a
// consumer importing it from node_modules still gets the component classes
// scanned by Tailwind.
function stylesheet(): Plugin {
  return {
    name: "lattice:stylesheet",
    generateBundle() {
      const css = readFileSync(
        path.join(sourceRoot, "../css/lattice.css"),
        "utf8",
      ).replace('@source "../js";', '@source "./**/*.js";');

      this.emitFile({ type: "asset", fileName: "lattice.css", source: css });
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
              exclude: ["resources/js/**/*.test.*", "resources/js/test/**"],
              outDir: "dist",
              afterBuild: () => {
                liftDeclarations();
                assertChunksSplit();
              },
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
                /^lucide-react($|\/)/,
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
      include: ["resources/js/**/*.test.{ts,tsx}"],
      setupFiles: ["resources/js/test/setup.ts"],
    },
  };
});
