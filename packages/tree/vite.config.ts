import inertia from "@inertiajs/vite";
import { lattice } from "../../resources/js/vite.ts";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins:
    mode === "plugin"
      ? [react()]
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
  ...(mode === "plugin"
    ? {
        build: {
          outDir: "dist",
          emptyOutDir: true,
          minify: false,
          lib: {
            entry: "resources/js/plugin.ts",
            formats: ["es"] as const,
            fileName: "plugin",
          },
          rollupOptions: {
            external: [/^@lattice-php\/lattice\/runtime$/, /^react(?:\/.*)?$/],
            output: { codeSplitting: false },
          },
        },
      }
    : {}),
}));
