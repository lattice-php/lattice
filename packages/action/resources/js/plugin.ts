import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { ActionNodeType } from "@lattice-php/core/generated";
import type { RendererComponent } from "@lattice-php/core/types";
import ActionComponent from "./components/action";
import ActionGroupComponent from "./components/action-group";

type ActionComponentType = Exclude<ActionNodeType, "action.bulk">;

export const actionComponents: Plugin = {
  components: {
    action: eagerComponent(ActionComponent as unknown as RendererComponent<"action">),
    "action.group": eagerComponent(
      ActionGroupComponent as unknown as RendererComponent<"action.group">,
    ),
  } satisfies ComponentRegistryFor<ActionComponentType>,
  name: "lattice/action",
};

export default actionComponents;
