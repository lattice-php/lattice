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
    .filter((file) => !file.startsWith("test/") && file !== "test-support.ts")
    .map((file) => path.join(sourceRoot, file));
}

function withExplicitExtensions(content: string): string {
  return content.replace(
    /(\bfrom\s*)(["'])(\.\.?(?:\/[^"']+)?)\2/g,
    (match, prefix: string, quote: string, specifier: string) =>
      /\.[a-z]+$/i.test(specifier) ? match : `${prefix}${quote}${specifier}.js${quote}`,
  );
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: path.resolve(import.meta.dirname, "tsconfig.json"),
      include: ["resources/js"],
      exclude: [
        "resources/js/**/*.test.*",
        "resources/js/**/*.test-d.*",
        "resources/js/test-support.*",
        "resources/js/test/**",
      ],
      compilerOptions: {
        paths: {},
        rootDir: sourceRoot,
      },
      beforeWriteFile: (filePath, content) => ({
        filePath,
        content: withExplicitExtensions(content),
      }),
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    lib: {
      entry: libraryEntries(),
      formats: ["es"],
    },
    rollupOptions: {
      external: (id) => !id.startsWith(".") && !path.isAbsolute(id),
      output: {
        preserveModules: true,
        preserveModulesRoot: "resources/js",
        entryFileNames: "[name].js",
      },
    },
  },
});
