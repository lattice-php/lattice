import { createLatticePlugin, lazyComponent } from "@/lattice/core/registry";

export const actionComponents = createLatticePlugin({
  components: {
    action: lazyComponent(() => import("./components/action")),
  },
  name: "lattice/action",
});
