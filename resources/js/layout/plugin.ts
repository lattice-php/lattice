import {
  createPlugin,
  eagerComponent,
  type ComponentRegistryFor,
} from "@lattice-php/lattice/core/registry";
import type { LayoutNodeType } from "@lattice-php/lattice/types/generated";
import BreadcrumbsComponent from "./components/breadcrumbs";
import CalloutsComponent from "./components/callouts";
import DropdownComponent from "./components/dropdown";
import MenuComponent from "./components/menu";
import MenuItemComponent from "./components/menu-item";
import OutletComponent from "./components/outlet";
import SidebarComponent from "./components/sidebar";
import TopbarComponent from "./components/topbar";

export const layoutComponents = createPlugin({
  components: {
    breadcrumbs: eagerComponent(BreadcrumbsComponent),
    callouts: eagerComponent(CalloutsComponent),
    dropdown: eagerComponent(DropdownComponent),
    menu: eagerComponent(MenuComponent),
    "menu-item": eagerComponent(MenuItemComponent),
    outlet: eagerComponent(OutletComponent),
    sidebar: eagerComponent(SidebarComponent),
    topbar: eagerComponent(TopbarComponent),
  } satisfies ComponentRegistryFor<LayoutNodeType>,
  name: "lattice/layout",
});
