import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { LayoutNodeType } from "@lattice-php/lattice/types/generated";
import CalloutsComponent from "./components/callouts";
import DropdownComponent from "./components/dropdown";
import MenuComponent from "./components/menu";
import MenuItemComponent from "./components/menu-item";
import OutletComponent from "./components/outlet";
import SidebarComponent from "./components/sidebar";
import SidebarFooterComponent from "./components/sidebar-footer";
import TopbarComponent from "./components/topbar";

export const layoutComponents: Plugin = {
  components: {
    callouts: eagerComponent(CalloutsComponent),
    dropdown: eagerComponent(DropdownComponent),
    menu: eagerComponent(MenuComponent),
    "menu-item": eagerComponent(MenuItemComponent),
    outlet: eagerComponent(OutletComponent),
    sidebar: eagerComponent(SidebarComponent),
    "sidebar.footer": eagerComponent(SidebarFooterComponent),
    topbar: eagerComponent(TopbarComponent),
  } satisfies ComponentRegistryFor<LayoutNodeType>,
  name: "lattice/layout",
};
