import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import { standalonePluginConfig } from "../vite.standalone.ts";

// pdf.js requires a same-version worker script served as a real URL; ship it as
// a second committed dist artifact next to plugin.js so the PHP worker route
// can stream it without pdfjs-dist existing in the consumer's node_modules.
function copyPdfWorker(): Plugin {
  const require = createRequire(import.meta.url);
  const pdfjsRoot = path.dirname(require.resolve("pdfjs-dist/package.json"));

  return {
    name: "lattice:pdf-copy-worker",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "pdf.worker.min.mjs",
        source: readFileSync(path.join(pdfjsRoot, "build/pdf.worker.min.mjs"), "utf8"),
      });
    },
  };
}

const config = standalonePluginConfig(import.meta.dirname);
config.plugins = [...(config.plugins ?? []), copyPdfWorker()];

export default defineConfig(config);
