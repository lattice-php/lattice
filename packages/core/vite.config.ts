import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const sourceRoot = path.resolve(import.meta.dirname, "resources/js");

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
      rollupTypes: true,
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
      entry: path.join(sourceRoot, "index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [/^react($|\/)/],
    },
  },
});
