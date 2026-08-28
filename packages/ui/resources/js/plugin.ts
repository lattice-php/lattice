import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { UiNodeType } from "./generated";
import { UI_NAMESPACE } from "./i18n";
import { AccordionAdapter } from "./components/accordion/accordion-adapter";
import { AvatarAdapter } from "./components/avatar/avatar-adapter";
import { BadgeAdapter } from "./components/badge/badge-adapter";
import { BreadcrumbsAdapter } from "./components/breadcrumbs/breadcrumbs-adapter";
import { ButtonAdapter } from "./components/button/button-adapter";
import { CalloutsAdapter } from "./components/callouts/callouts-adapter";
import { CardAdapter } from "./components/card/card-adapter";
import { ChartAdapter } from "./components/chart/chart-adapter";
import { CodeBlockAdapter } from "./components/code-block/code-block-adapter";
import { CollapsibleAdapter } from "./components/collapsible/collapsible-adapter";
import { DescriptionListAdapter } from "./components/description-list/description-list-adapter";
import { DropdownAdapter } from "./components/dropdown/dropdown-adapter";
import { FloatingPanelAdapter } from "./components/floating-panel/floating-panel-adapter";
import { GridAdapter } from "./components/grid/grid-adapter";
import { HeadingAdapter } from "./components/heading/heading-adapter";
import { IconAdapter } from "./components/icon/icon-adapter";
import { ImageAdapter } from "./components/image/image-adapter";
import { LinkAdapter } from "./components/link/link-adapter";
import { MenuAdapter } from "./components/menu/menu-adapter";
import { MenuItemAdapter } from "./components/menu-item/menu-item-adapter";
import { ModalAdapter } from "./components/modal/modal-adapter";
import { PopoverAdapter } from "./components/popover/popover-adapter";
import { ProgressAdapter } from "./components/progress/progress-adapter";
import { RawBlockAdapter } from "./components/raw-block/raw-block-adapter";
import { SectionAdapter } from "./components/section/section-adapter";
import { SegmentedControlAdapter } from "./components/segmented-control/segmented-control-adapter";
import { SeparatorAdapter } from "./components/separator/separator-adapter";
import { SidebarAdapter } from "./components/sidebar/sidebar-adapter";
import { SidebarFooterAdapter } from "./components/sidebar/sidebar-footer-adapter";
import { StackAdapter } from "./components/stack/stack-adapter";
import { TabAdapter, TabsAdapter } from "./components/tabs/tabs-adapter";
import { TextAdapter } from "./components/text/text-adapter";
import { TooltipAdapter } from "./components/tooltip/tooltip-adapter";
import { TopbarAdapter } from "./components/topbar/topbar-adapter";
import {
  BadgeEntryAdapter,
  BooleanEntryAdapter,
  ComponentEntryAdapter,
  DateEntryAdapter,
  TextEntryAdapter,
} from "./components/description-list/entries";

export const uiComponents: Plugin = {
  components: {
    accordion: eagerComponent(AccordionAdapter),
    avatar: eagerComponent(AvatarAdapter),
    badge: eagerComponent(BadgeAdapter),
    breadcrumbs: eagerComponent(BreadcrumbsAdapter),
    button: eagerComponent(ButtonAdapter),
    callouts: eagerComponent(CalloutsAdapter),
    card: eagerComponent(CardAdapter),
    chart: eagerComponent(ChartAdapter),
    "code-block": eagerComponent(CodeBlockAdapter),
    collapsible: eagerComponent(CollapsibleAdapter),
    "description-list": eagerComponent(DescriptionListAdapter),
    dropdown: eagerComponent(DropdownAdapter),
    "entry.badge": eagerComponent(BadgeEntryAdapter),
    "entry.boolean": eagerComponent(BooleanEntryAdapter),
    "entry.component": eagerComponent(ComponentEntryAdapter),
    "entry.date": eagerComponent(DateEntryAdapter),
    "entry.text": eagerComponent(TextEntryAdapter),
    "floating-panel": eagerComponent(FloatingPanelAdapter),
    grid: eagerComponent(GridAdapter),
    heading: eagerComponent(HeadingAdapter),
    icon: eagerComponent(IconAdapter),
    image: eagerComponent(ImageAdapter),
    link: eagerComponent(LinkAdapter),
    menu: eagerComponent(MenuAdapter),
    "menu-item": eagerComponent(MenuItemAdapter),
    modal: eagerComponent(ModalAdapter),
    popover: eagerComponent(PopoverAdapter),
    progress: eagerComponent(ProgressAdapter),
    "raw-block": eagerComponent(RawBlockAdapter),
    section: eagerComponent(SectionAdapter),
    "segmented-control": eagerComponent(SegmentedControlAdapter),
    separator: eagerComponent(SeparatorAdapter),
    sidebar: eagerComponent(SidebarAdapter),
    "sidebar.footer": eagerComponent(SidebarFooterAdapter),
    stack: eagerComponent(StackAdapter),
    tab: eagerComponent(TabAdapter),
    tabs: eagerComponent(TabsAdapter),
    text: eagerComponent(TextAdapter),
    tooltip: eagerComponent(TooltipAdapter),
    topbar: eagerComponent(TopbarAdapter),
  } satisfies ComponentRegistryFor<UiNodeType>,
  i18n: { namespace: UI_NAMESPACE },
  name: "lattice/ui",
};
