import { createPlugin, eagerComponent } from "@lattice/lattice/core/registry";
import MenuComponent from "./menu";
import MenuItemComponent from "./menu-item";
import OutletComponent from "./outlet";

export const layoutComponents = createPlugin({
  components: {
    menu: eagerComponent(MenuComponent),
    "menu-item": eagerComponent(MenuItemComponent),
    outlet: eagerComponent(OutletComponent),
  },
  name: "lattice/layout",
});
