import { lazyComponent, type Plugin } from "@lattice-php/core/registry";

export default {
  name: "lattice/search",
  components: {
    "search.box": lazyComponent(() => import("./components/search-box")),
    "search.categories": lazyComponent(() => import("./components/categories")),
    "search.input": lazyComponent(() => import("./components/input")),
    "search.preview": lazyComponent(() => import("./components/preview")),
    "search.recent": lazyComponent(() => import("./components/recent")),
    "search.results": lazyComponent(() => import("./components/results")),
  },
  i18n: {
    namespace: "search",
  },
} satisfies Plugin;
