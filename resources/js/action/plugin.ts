import {
  eagerComponent,
  type ComponentRegistryFor,
  type Plugin,
} from "@lattice-php/lattice/core/registry";
import type { ActionNodeType } from "@lattice-php/lattice/types/generated";
import ActionComponent from "./components/action";
import ActionGroupComponent from "./components/action-group";

type ActionComponentType = Exclude<ActionNodeType, "action.bulk">;

export const actionComponents = {
  components: {
    action: eagerComponent(ActionComponent),
    "action.group": eagerComponent(ActionGroupComponent),
  } satisfies ComponentRegistryFor<ActionComponentType>,
  name: "lattice/action",
} satisfies Plugin;
