import { createPlugin, eagerComponent } from "@lattice-php/lattice/core/registry";
import BadgeComponent from "./badge";
import ButtonComponent from "./button";
import CardComponent from "./card";
import ChartComponent from "./chart";
import CollapsibleComponent from "./collapsible";
import FloatingPanelComponent from "./floating-panel";
import FragmentComponent from "./fragment";
import GridComponent from "./grid";
import HeadingComponent from "./heading";
import IconComponent from "./icon";
import LinkComponent from "./link";
import ModalComponent from "./modal";
import RawBlockComponent from "./raw-block";
import SectionComponent from "./section";
import SegmentedControlComponent from "./segmented-control";
import StackComponent from "./stack";
import TabComponent, { TabsComponent } from "./tabs";
import TextComponent from "./text";
import TooltipComponent from "./tooltip";

export const coreComponents = createPlugin({
  components: {
    badge: eagerComponent(BadgeComponent),
    button: eagerComponent(ButtonComponent),
    card: eagerComponent(CardComponent),
    chart: eagerComponent(ChartComponent),
    collapsible: eagerComponent(CollapsibleComponent),
    "floating-panel": eagerComponent(FloatingPanelComponent),
    fragment: eagerComponent(FragmentComponent),
    grid: eagerComponent(GridComponent),
    heading: eagerComponent(HeadingComponent),
    icon: eagerComponent(IconComponent),
    link: eagerComponent(LinkComponent),
    modal: eagerComponent(ModalComponent),
    "raw-block": eagerComponent(RawBlockComponent),
    section: eagerComponent(SectionComponent),
    "segmented-control": eagerComponent(SegmentedControlComponent),
    stack: eagerComponent(StackComponent),
    tab: eagerComponent(TabComponent),
    tabs: eagerComponent(TabsComponent),
    text: eagerComponent(TextComponent),
    tooltip: eagerComponent(TooltipComponent),
  },
  name: "lattice/core",
});
