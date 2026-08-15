import { lazy } from "react";
import { lazyComponent, type Plugin } from "@lattice-php/core/registry";
import type { PdfEngineComponent } from "./engine-registry";

const Engine = lazy(() => import("./engine")) as PdfEngineComponent;

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
