import inertia from "@inertiajs/vite";
import { lattice } from "../../resources/js/vite.ts";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import { readdirSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const sourceRoot = path.resolve(import.meta.dirname, "resources/js");

function libraryEntries(): string[] {
  return readdirSync(sourceRoot, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.(ts|tsx)$/.test(file))
    .filter((file) => !/\.(test(-d)?|d)\.(ts|tsx)$/.test(file))
    .filter((file) => !/test-(setup|support)\.(ts|tsx)$/.test(file))
    .map((file) => path.join(sourceRoot, file));
}

function withExplicitExtensions(content: string): string {
  return content.replace(
    /(\bfrom\s*|\bimport\()(["'])(\.\.?(?:\/[^"']+)?)\2/g,
    (match, prefix: string, quote: string, specifier: string) =>
      /\.[a-z]+$/i.test(specifier) ? match : `${prefix}${quote}${specifier}.js${quote}`,
  );
}

export default defineConfig(({ mode }) => {
  const isStandalone = mode === "standalone";
  const isPackageBuild = mode === "plugin" || isStandalone;

  return {
    plugins: isPackageBuild
      ? [
          react(),
          ...(isStandalone
            ? []
            : [
                dts({
                  tsconfigPath: path.resolve(import.meta.dirname, "tsconfig.json"),
                  include: ["resources/js"],
                  exclude: [
                    "resources/js/**/*.test.*",
                    "resources/js/**/*.test-d.*",
                    "resources/js/test-*.ts*",
                  ],
                  beforeWriteFile: (filePath, content) => ({
                    filePath,
                    content: withExplicitExtensions(content),
                  }),
                }),
              ]),
        ]
      : [
          lattice({ icons: { dts: false } }),
          laravel({
            input: ["workbench/resources/css/app.css", "workbench/resources/js/app.tsx"],
            publicDirectory: "vendor/orchestra/testbench-core/laravel/public",
            buildDirectory: "build",
            refresh: ["workbench/app/**", "workbench/resources/views/**", "resources/js/**"],
          }),
          inertia(),
          react(),
          tailwindcss(),
        ],
    ...(isPackageBuild
      ? {
          build: {
            outDir: "dist",
            emptyOutDir: !isStandalone,
            minify: false,
            sourcemap: true,
            lib: {
              entry: isStandalone ? path.join(sourceRoot, "plugin.ts") : libraryEntries(),
              formats: ["es"] as const,
            },
            rollupOptions: {
              external: (id) => !id.startsWith(".") && !path.isAbsolute(id),
              output: isStandalone
                ? {
                    codeSplitting: false,
                    entryFileNames: "standalone.js",
                    paths: (id: string) =>
                      id === "@inertiajs/react" ||
                      id.startsWith("@lattice-php/core") ||
                      id.startsWith("@lattice-php/ui")
                        ? "@lattice-php/lattice/runtime"
                        : id,
                  }
                : {
                    preserveModules: true,
                    preserveModulesRoot: "resources/js",
                    entryFileNames: "[name].js",
                  },
            },
          },
        }
      : {}),
  };
});
