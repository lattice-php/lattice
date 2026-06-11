import { createPlugin, eagerComponent } from "@lattice/lattice/core/registry";
import MenuComponent from "./menu";
import MenuItemComponent from "./menu-item";
import OutletComponent from "./outlet";
import SidebarComponent from "./sidebar";

export const layoutComponents = createPlugin({
  components: {
    menu: eagerComponent(MenuComponent),
    "menu-item": eagerComponent(MenuItemComponent),
    outlet: eagerComponent(OutletComponent),
    sidebar: eagerComponent(SidebarComponent),
  },
  name: "lattice/layout",
});
