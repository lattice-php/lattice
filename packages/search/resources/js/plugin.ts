import { lazyComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { NodeType as SearchNodeType } from "./generated";

export default {
  name: "lattice/search",
  components: {
    "search.box": lazyComponent(() => import("./components/search-box/search-box-adapter")),
    "search.categories": lazyComponent(() => import("./components/categories/categories-adapter")),
    "search.input": lazyComponent(() => import("./components/input/input-adapter")),
    "search.preview": lazyComponent(() => import("./components/preview/preview-adapter")),
    "search.recent": lazyComponent(() => import("./components/recent/recent-adapter")),
    "search.results": lazyComponent(() => import("./components/results/results-adapter")),
  } satisfies ComponentRegistryFor<SearchNodeType>,
  i18n: {
    namespace: "search",
  },
} satisfies Plugin;
