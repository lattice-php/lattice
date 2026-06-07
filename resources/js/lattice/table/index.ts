import { createLatticePlugin, lazyComponent } from "@/lattice/core/registry";

export const tableComponents = createLatticePlugin({
  components: {
    table: lazyComponent(() => import("./components/table")),
  },
  name: "lattice/table",
});
