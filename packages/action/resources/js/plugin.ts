import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { ActionNodeType } from "./generated";
import ActionComponent from "./components/action";
import ActionGroupComponent from "./components/action-group";

type ActionComponentType = Exclude<ActionNodeType, "action.bulk">;

export const actionComponents: Plugin = {
  components: {
    action: eagerComponent(ActionComponent),
    "action.group": eagerComponent(ActionGroupComponent),
  } satisfies ComponentRegistryFor<ActionComponentType>,
  name: "lattice/action",
};
