import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { UiNodeType } from "./generated";
import { UI_NAMESPACE } from "./i18n";
import AvatarComponent from "./components/avatar";
import BadgeComponent from "./components/badge";
import ButtonComponent from "./components/button";
import CardComponent from "./components/card";
import ChartComponent from "./components/chart";
import CodeBlockComponent from "./components/code-block";
import CollapsibleComponent from "./components/collapsible";
import FloatingPanelComponent from "./components/floating-panel";
import GridComponent from "./components/grid";
import HeadingComponent from "./components/heading";
import IconComponent from "./components/icon";
import ImageComponent from "./components/image";
import LinkComponent from "./components/link";
import ModalComponent from "./components/modal";
import ProgressComponent from "./components/progress";
import RawBlockComponent from "./components/raw-block";
import SectionComponent from "./components/section";
import SegmentedControlComponent from "./components/segmented-control";
import SeparatorComponent from "./components/separator";
import StackComponent from "./components/stack";
import TabComponent, { TabsComponent } from "./components/tabs";
import TextComponent from "./components/text";
import TooltipComponent from "./components/tooltip";

export const uiComponents: Plugin = {
  components: {
    avatar: eagerComponent(AvatarComponent),
    badge: eagerComponent(BadgeComponent),
    button: eagerComponent(ButtonComponent),
    card: eagerComponent(CardComponent),
    chart: eagerComponent(ChartComponent),
    "code-block": eagerComponent(CodeBlockComponent),
    collapsible: eagerComponent(CollapsibleComponent),
    "floating-panel": eagerComponent(FloatingPanelComponent),
    grid: eagerComponent(GridComponent),
    heading: eagerComponent(HeadingComponent),
    icon: eagerComponent(IconComponent),
    image: eagerComponent(ImageComponent),
    link: eagerComponent(LinkComponent),
    modal: eagerComponent(ModalComponent),
    progress: eagerComponent(ProgressComponent),
    "raw-block": eagerComponent(RawBlockComponent),
    section: eagerComponent(SectionComponent),
    "segmented-control": eagerComponent(SegmentedControlComponent),
    separator: eagerComponent(SeparatorComponent),
    stack: eagerComponent(StackComponent),
    tab: eagerComponent(TabComponent),
    tabs: eagerComponent(TabsComponent),
    text: eagerComponent(TextComponent),
    tooltip: eagerComponent(TooltipComponent),
  } satisfies ComponentRegistryFor<UiNodeType>,
  i18n: { namespace: UI_NAMESPACE },
  name: "lattice/ui",
};
