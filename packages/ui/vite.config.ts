import react from "@vitejs/plugin-react";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import dts from "vite-plugin-dts";

const sourceRoot = path.resolve(import.meta.dirname, "resources/js");

function libraryEntries(): string[] {
  return readdirSync(sourceRoot, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.(ts|tsx)$/.test(file))
    .filter((file) => !/\.(test(-d)?|d)\.(ts|tsx)$/.test(file))
    .filter((file) => file !== "test-setup.ts" && file !== "types.ts")
    .map((file) => path.join(sourceRoot, file));
}

function stylesheet(): Plugin {
  return {
    name: "lattice:ui-stylesheet",
    generateBundle() {
      const css = readFileSync(
        path.resolve(import.meta.dirname, "resources/css/lattice.css"),
        "utf8",
      );

      this.emitFile({
        type: "asset",
        fileName: "lattice.css",
        source: `@source "./**/*.js";\n\n${css}`,
      });
    },
  };
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
        "resources/js/test-setup.ts",
      ],
      beforeWriteFile: (filePath, content) => ({
        filePath,
        content: withExplicitExtensions(content),
      }),
    }),
    stylesheet(),
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
