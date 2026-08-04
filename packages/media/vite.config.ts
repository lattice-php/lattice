import react from "@vitejs/plugin-react";
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

  return {
    plugins: [
      react(),
      ...(isStandalone
        ? []
        : [
            dts({
              tsconfigPath: path.resolve(import.meta.dirname, "tsconfig.json"),
              include: ["resources/js"],
              exclude: ["resources/js/**/*.test.*", "resources/js/test-*.ts*"],
              aliasesExclude: [/^@lattice-php\/(action|core|form|table|ui)(?:\/|$)/],
              beforeWriteFile: (filePath, content) => ({
                filePath,
                content: withExplicitExtensions(content),
              }),
            }),
          ]),
    ],
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
        external: isStandalone
          ? (id) =>
              id === "react" ||
              id === "react/jsx-runtime" ||
              id.startsWith("@lattice-php/") ||
              id.startsWith("@tiptap/")
          : (id) => !id.startsWith(".") && !path.isAbsolute(id),
        output: isStandalone
          ? {
              codeSplitting: false,
              entryFileNames: "standalone.js",
              paths: (id: string) =>
                id.startsWith("@lattice-php/") || id.startsWith("@tiptap/")
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
  };
});
