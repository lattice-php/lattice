import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@lattice-php/action": path.resolve(import.meta.dirname, "../action/resources/js"),
      "@lattice-php/core": path.resolve(import.meta.dirname, "../core/resources/js"),
      "@lattice-php/form": path.resolve(import.meta.dirname, "../form/resources/js"),
      "@lattice-php/table": path.resolve(import.meta.dirname, "../table/resources/js"),
      "@lattice-php/ui": path.resolve(import.meta.dirname, "../ui/resources/js"),
      "@lattice-php/lattice": path.resolve(import.meta.dirname, "resources/js"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["resources/js/**/*.test.{ts,tsx}"],
    exclude: ["resources/js/**/*.browser.test.{ts,tsx}"],
    setupFiles: ["resources/js/test/setup.ts"],
  },
});
