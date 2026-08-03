import { lazyComponent, type Plugin } from "@lattice-php/lattice/runtime";

export default {
  name: "lattice/tree",
  components: {
    tree: lazyComponent(() => import("./tree")),
  },
  i18n: {
    namespace: "tree",
  },
} satisfies Plugin;
