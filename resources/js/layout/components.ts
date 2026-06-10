import { createPlugin, eagerComponent } from "@lattice/lattice/core/registry";
import OutletComponent from "./outlet";

export const layoutComponents = createPlugin({
  components: {
    outlet: eagerComponent(OutletComponent),
  },
  name: "lattice/layout",
});
