import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { LayoutNodeType } from "@lattice-php/lattice/types/generated";
import CalloutsComponent from "./components/callouts";
import MenuComponent from "./components/menu";
import MenuItemComponent from "./components/menu-item";
import OutletComponent from "./components/outlet";

export const layoutComponents: Plugin = {
  components: {
    callouts: eagerComponent(CalloutsComponent),
    menu: eagerComponent(MenuComponent),
    "menu-item": eagerComponent(MenuItemComponent),
    outlet: eagerComponent(OutletComponent),
  } satisfies ComponentRegistryFor<LayoutNodeType>,
  name: "lattice/layout",
};
