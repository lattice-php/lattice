import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { buildSprite } from "@lattice-php/vite-svg-sprite";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";

const sourceRoot = path.resolve(import.meta.dirname, "resources/js");

function libraryEntries(): string[] {
  return (
    readdirSync(sourceRoot, { recursive: true, encoding: "utf8" })
      .filter((file) => /\.(ts|tsx)$/.test(file))
      .filter((file) => !/\.(test(-d)?|d)\.(ts|tsx)$/.test(file))
      .filter((file) => !file.startsWith("test/"))
      // Type-only sources compile to empty chunks; they ship as .d.ts via the
      // dts plugin and are exposed through types-only export conditions.
      .filter((file) => !file.startsWith("types/"))
      .filter((file) => !file.startsWith("standalone/"))
      .map((file) => path.join(sourceRoot, file))
  );
}

/**
 * TypeScript's node16/nodenext resolution requires explicit runtime extensions
 * on relative imports. Sources use bundler-style extensionless specifiers, so
 * the emitted declarations must be rewritten to stay resolvable outside
 * bundlers (verified by `attw` in check:package).
 */
function withExplicitExtensions(filePath: string, content: string): string {
  const sourceDir = path.join(
    sourceRoot,
    path.relative(path.resolve(import.meta.dirname, "dist"), path.dirname(filePath)),
  );
  const existsAsModule = (base: string): boolean =>
    ["ts", "tsx"].some((extension) => existsSync(`${base}.${extension}`));

  return content.replace(
    /(\b(?:from|import)\s*\(?\s*)(["'])(\.\.?(?:\/[^"']+)?)\2/g,
    (match, prefix: string, quote: string, specifier: string) => {
      const target = path.join(sourceDir, specifier);

      if (existsAsModule(target)) {
        return `${prefix}${quote}${specifier}.js${quote}`;
      }

      if (existsAsModule(path.join(target, "index"))) {
        return `${prefix}${quote}${specifier}/index.js${quote}`;
      }

      return match;
    },
  );
}

function standaloneSprite(): Plugin {
  return {
    name: "lattice:standalone-sprite",
    generateBundle() {
      const sprite = buildSprite([path.resolve(import.meta.dirname, "../ui/resources/icons")]);

      this.emitFile({ type: "asset", fileName: "sprite.svg", source: sprite.source });
    },
  };
}

function standaloneManifest(): Plugin {
  return {
    name: "lattice:standalone-manifest",
    generateBundle() {
      const { version } = JSON.parse(
        readFileSync(path.resolve(import.meta.dirname, "package.json"), "utf8"),
      ) as {
        version: string;
      };

      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: `${JSON.stringify({ version }, null, 2)}\n`,
      });
    },
  };
}

function stylesheet(): Plugin {
  return {
    name: "lattice:stylesheet",
    generateBundle() {
      const css = readFileSync(
        path.resolve(import.meta.dirname, "../ui/resources/css/lattice.css"),
        "utf8",
      );

      this.emitFile({
        type: "asset",
        fileName: "lattice.css",
        // Ship the stylesheet with @source pointing at the package's compiled output,
        // so tailwind scans correctly for classes in built-in components.
        source: `@source "./**/*.js";\n\n${css}`,
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const isStandalone = mode === "standalone";

  return {
    publicDir: false,
    plugins: [
      react(),
      ...(isStandalone
        ? [tailwindcss(), standaloneSprite(), standaloneManifest()]
        : [
            dts({
              tsconfigPath: path.resolve(import.meta.dirname, "tsconfig.json"),
              aliasesExclude: [/^@lattice-php\/(?:action|core|form|table|ui)(?:\/|$)/],
              include: ["resources/js"],
              copyDtsFiles: true,
              exclude: [
                "resources/js/**/*.test.*",
                "resources/js/**/*.test-d.*",
                "resources/js/test/**",
                "resources/js/standalone/**",
              ],
              compilerOptions: {
                rootDir: sourceRoot,
                paths: {
                  "@lattice-php/action": ["../action/dist/index.d.ts"],
                  "@lattice-php/action/*": ["../action/dist/*"],
                  "@lattice-php/core": ["../core/dist/index.d.ts"],
                  "@lattice-php/core/*": ["../core/dist/index.d.ts"],
                  "@lattice-php/form": ["../form/dist/index.d.ts"],
                  "@lattice-php/form/*": ["../form/dist/*"],
                  "@lattice-php/table": ["../table/dist/index.d.ts"],
                  "@lattice-php/table/*": ["../table/dist/*"],
                  "@lattice-php/lattice": ["resources/js/index.ts"],
                  "@lattice-php/lattice/*": ["resources/js/*"],
                },
              },
              outDirs: "dist",
              // vite-plugin-dts strips side-effect imports of type-only modules,
              // which orphans the ComponentProps augmentation in published dist.
              beforeWriteFile: (filePath, content) => {
                const withExtensions = withExplicitExtensions(filePath, content);
                const isRootEntry =
                  filePath === path.resolve(import.meta.dirname, "dist/index.d.ts");

                return {
                  filePath,
                  content: isRootEntry
                    ? `import "./types/core-augmentation.js";\n${withExtensions}`
                    : withExtensions,
                };
              },
            }),
            stylesheet(),
          ]),
    ],
    resolve: {
      alias: {
        "@lattice-php/action": path.resolve(import.meta.dirname, "../action/resources/js"),
        "@lattice-php/core": path.resolve(import.meta.dirname, "../core/resources/js"),
        "@lattice-php/form": path.resolve(import.meta.dirname, "../form/resources/js"),
        "@lattice-php/table": path.resolve(import.meta.dirname, "../table/resources/js"),
        "@lattice-php/ui": path.resolve(import.meta.dirname, "../ui/resources/js"),
        "@lattice-php/lattice": sourceRoot,
      },
    },
    ...(isStandalone
      ? {
          base: "./",
          build: {
            outDir: "dist-standalone",
            emptyOutDir: true,
            sourcemap: false,
            cssCodeSplit: false,
            rollupOptions: {
              preserveEntrySignatures: "strict" as const,
              input: {
                lattice: path.resolve(sourceRoot, "standalone/main.tsx"),
                runtime: path.resolve(sourceRoot, "runtime.ts"),
                react: path.resolve(sourceRoot, "standalone/react.ts"),
                "react-dom": path.resolve(sourceRoot, "standalone/react-dom.ts"),
                "jsx-runtime": path.resolve(sourceRoot, "standalone/jsx-runtime.ts"),
              },
              output: {
                entryFileNames: "[name].js",
                chunkFileNames: "chunks/[name]-[hash].js",
                assetFileNames: (info: { names: string[] }) =>
                  info.names.some((name) => name.endsWith(".css"))
                    ? "lattice.css"
                    : "assets/[name]-[hash][extname]",
              },
            },
          },
        }
      : {
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
              external: [
                /^node:/,
                /^@lattice-php\/action($|\/)/,
                /^@lattice-php\/core($|\/)/,
                /^@lattice-php\/form($|\/)/,
                /^@lattice-php\/table($|\/)/,
                /^@lattice-php\/ui($|\/)/,
                /^react($|\/)/,
                /^react-dom($|\/)/,
                /^@atlaskit\//,
                /^@codemirror\//,
                /^@inertiajs\//,
                /^@internationalized\/date($|\/)/,
                /^@lattice-php\/vite-svg-sprite($|\/)/,
                /^@lezer\//,
                /^@radix-ui\//,
                /^@tiptap\//,
                /^@zag-js\//,
                /^clsx($|\/)/,
                /^class-variance-authority($|\/)/,
                /^input-otp($|\/)/,
                /^react-colorful($|\/)/,
                /^tailwind-merge($|\/)/,
                /^vite($|\/)/,
                /^@laravel\/echo-react($|\/)/,
                /^i18next($|\/)/,
                /^i18next-http-backend($|\/)/,
                /^recharts($|\/)/,
              ],
              output: {
                preserveModules: true,
                preserveModulesRoot: "resources/js",
                entryFileNames: "[name].js",
              },
            },
          },
        }),
  };
});
