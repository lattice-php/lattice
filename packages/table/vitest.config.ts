import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { workspaceAliases } from "../vitest.shared";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: workspaceAliases,
  },
  test: {
    environment: "jsdom",
    include: ["resources/js/**/*.test.{ts,tsx}"],
    exclude: ["resources/js/**/*.browser.test.{ts,tsx}"],
    setupFiles: ["resources/js/test-setup.ts"],
  },
});
