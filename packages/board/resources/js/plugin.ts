import { lazyComponent, type Plugin } from "@lattice-php/core/registry";

export default {
  name: "lattice/board",
  components: {
    board: lazyComponent(() => import("./components/board/board-adapter")),
  },
  i18n: {
    namespace: "board",
  },
} satisfies Plugin;
