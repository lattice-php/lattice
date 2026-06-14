import { createPlugin, eagerComponent } from "@lattice-php/lattice/core/registry";
import BreadcrumbsComponent from "./breadcrumbs";
import CalloutsComponent from "./callouts";
import DropdownComponent from "./dropdown";
import MenuComponent from "./menu";
import MenuItemComponent from "./menu-item";
import OutletComponent from "./outlet";
import SidebarComponent from "./sidebar";

export const layoutComponents = createPlugin({
  components: {
    breadcrumbs: eagerComponent(BreadcrumbsComponent),
    callouts: eagerComponent(CalloutsComponent),
    dropdown: eagerComponent(DropdownComponent),
    menu: eagerComponent(MenuComponent),
    "menu-item": eagerComponent(MenuItemComponent),
    outlet: eagerComponent(OutletComponent),
    sidebar: eagerComponent(SidebarComponent),
  },
  name: "lattice/layout",
});
