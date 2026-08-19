import { lazyComponent, type Plugin } from "@lattice-php/core/registry";

export default {
  name: "lattice/tree",
  components: {
    "field.tree": lazyComponent(() => import("./tree-field")),
    tree: lazyComponent(() => import("./tree")),
  },
  i18n: {
    namespace: "tree",
  },
} satisfies Plugin;
