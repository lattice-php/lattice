import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { LayoutNodeType } from "@lattice-php/lattice/types/generated";
import OutletComponent from "./components/outlet";

export const layoutComponents: Plugin = {
  components: {
    outlet: eagerComponent(OutletComponent),
  } satisfies ComponentRegistryFor<LayoutNodeType>,
  name: "lattice/layout",
};
