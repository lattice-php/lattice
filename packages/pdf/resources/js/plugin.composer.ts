import { createElement, lazy } from "react";
import type { ComponentType } from "react";
import { lazyComponent, type Plugin } from "@lattice-php/core/registry";
import type { PdfEngineProps } from "./engine-registry";

type DistPluginModule = {
  default: {
    extensions: { "pdf.engine": { engine: ComponentType<PdfEngineProps> } };
  };
};

const distPlugin = (): Promise<DistPluginModule> => import("../../dist/plugin.js");

const Engine = lazy(async () => {
  const { default: plugin } = await distPlugin();
  const EngineComponent = plugin.extensions["pdf.engine"].engine;

  // React.lazy rejects a lazy component as its resolved value, and the dist
  // artifact exports one — unwrap through a plain component.
  return { default: (props: PdfEngineProps) => createElement(EngineComponent, props) };
});

/**
 * The Composer-facing plugin entry: a consumer's Vite build compiles only this
 * shell into the initial bundle. The viewer component loads lazily from
 * source, and the engine loads pdf.js through the self-contained
 * `dist/plugin.js` artifact — pdfjs-dist never needs to exist in the
 * consumer's node_modules and never ships eagerly. No-build apps use
 * `dist/plugin.js` directly via the `standalone` manifest key instead.
 */
export default {
  name: "lattice/pdf",
  components: {
    pdf: lazyComponent(() => import("./pdf-viewer")),
  },
  extensions: {
    "pdf.engine": {
      engine: Engine,
    },
  },
  i18n: {
    namespace: "pdf",
  },
} satisfies Plugin;
