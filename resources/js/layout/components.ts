import { createPlugin, eagerComponent } from "@lattice/lattice/core/registry";
import DropdownComponent from "./dropdown";
import MenuComponent from "./menu";
import MenuItemComponent from "./menu-item";
import OutletComponent from "./outlet";
import SidebarComponent from "./sidebar";
import UserMenuComponent from "./user-menu";

export const layoutComponents = createPlugin({
  components: {
    dropdown: eagerComponent(DropdownComponent),
    menu: eagerComponent(MenuComponent),
    "menu-item": eagerComponent(MenuItemComponent),
    outlet: eagerComponent(OutletComponent),
    sidebar: eagerComponent(SidebarComponent),
    "user-menu": eagerComponent(UserMenuComponent),
  },
  name: "lattice/layout",
});
