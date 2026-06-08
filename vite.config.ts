import inertia from "@inertiajs/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    laravel({
      input: ["workbench/resources/css/app.css", "workbench/resources/js/app.tsx"],
      publicDirectory: "vendor/orchestra/testbench-core/laravel/public",
      buildDirectory: "build",
      refresh: ["workbench/resources/**", "workbench/routes/**", "resources/js/**"],
    }),
    inertia(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@lattice": path.resolve(__dirname, "resources/js"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["resources/js/**/*.test.{ts,tsx}"],
    setupFiles: ["resources/js/test/setup.ts"],
  },
});
