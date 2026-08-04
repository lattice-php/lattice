import { lazyComponent, type Plugin } from "@lattice-php/core";

export default {
  name: "lattice/tree",
  components: {
    tree: lazyComponent(() => import("./tree")),
  },
  i18n: {
    namespace: "tree",
  },
} satisfies Plugin;
