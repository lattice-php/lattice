import { createPlugin, lazyComponent } from "@lattice/core/registry";

export const tableComponents = createPlugin({
  components: {
    table: lazyComponent(() => import("./components/table")),
  },
  name: "lattice/table",
});
