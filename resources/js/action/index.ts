import { createLatticePlugin, eagerComponent } from "@/lattice/core/registry";
import ActionComponent from "./components/action";
import ActionGroupComponent from "./components/action-group";

export const actionComponents = createLatticePlugin({
  components: {
    action: eagerComponent(ActionComponent),
    "action.group": eagerComponent(ActionGroupComponent),
  },
  name: "lattice/action",
});
