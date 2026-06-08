import { createPlugin, eagerComponent } from "@lattice/core/registry";
import ActionComponent from "./components/action";
import ActionGroupComponent from "./components/action-group";

export const actionComponents = createPlugin({
  components: {
    action: eagerComponent(ActionComponent),
    "action.group": eagerComponent(ActionGroupComponent),
  },
  name: "lattice/action",
});
