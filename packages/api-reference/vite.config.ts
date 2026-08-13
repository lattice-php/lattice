import react from "@vitejs/plugin-react";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import dts from "vite-plugin-dts";
import { standalonePluginConfig } from "../vite.standalone.ts";

const sourceRoot = path.resolve(import.meta.dirname, "resources/js");

function libraryEntries(): string[] {
  return readdirSync(sourceRoot, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.(ts|tsx)$/.test(file))
    .filter((file) => !/\.(test(-d)?|d)\.(ts|tsx)$/.test(file))
    .filter((file) => file !== "test-support.ts")
    .map((file) => path.join(sourceRoot, file));
}

function stylesheet(): Plugin {
  return {
    name: "lattice:api-reference-stylesheet",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "api-reference.css",
        // FormFieldFrame's classes live in @lattice-php/form's compiled
        // output; the relative @source relies on npm's flat node_modules
        // layout (documented for pnpm consumers).
        source: [
          '@import "@lattice-php/ui/css";',
          '@source "./**/*.js";',
          '@source "../../form/dist/components/base";',
          "",
        ].join("\n"),
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

export default defineConfig(({ mode }) => {
  if (mode === "standalone") {
    return standalonePluginConfig(import.meta.dirname, { outDir: "dist-standalone" });
  }

  return {
    plugins: [
      react(),
      dts({
        tsconfigPath: path.resolve(import.meta.dirname, "tsconfig.json"),
        include: ["resources/js"],
        exclude: [
          "resources/js/**/*.test.*",
          "resources/js/**/*.test-d.*",
          "resources/js/test-support.*",
        ],
        compilerOptions: {
          paths: {
            "@lattice-php/api-reference": [path.join(sourceRoot, "index.ts")],
            "@lattice-php/api-reference/*": [path.join(sourceRoot, "*")],
          },
          rootDir: sourceRoot,
        },
        // vite-plugin-dts strips side-effect imports of type-only modules,
        // which orphans the ComponentProps augmentation on the plugin path.
        beforeWriteFile: (filePath, content) => {
          const withExtensions = withExplicitExtensions(content);
          const isPluginEntry = filePath === path.resolve(import.meta.dirname, "dist/plugin.d.ts");

          return {
            filePath,
            content: isPluginEntry ? `import "./types.js";\n${withExtensions}` : withExtensions,
          };
        },
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
        formats: ["es"] as const,
      },
      rollupOptions: {
        external: (id: string) => !id.startsWith(".") && !path.isAbsolute(id),
        output: {
          preserveModules: true,
          preserveModulesRoot: "resources/js",
          entryFileNames: "[name].js",
        },
      },
    },
  };
});
