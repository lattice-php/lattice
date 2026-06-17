import { createPlugin, eagerComponent, lazyComponent } from "@lattice-php/lattice/core/registry";
import type { RendererComponentModule } from "@lattice-php/lattice/core/types";
import BadgeComponent from "./badge";
import ButtonComponent from "./button";
import CardComponent from "./card";
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

export const coreComponents = createPlugin({
  components: {
    badge: eagerComponent(BadgeComponent),
    button: eagerComponent(ButtonComponent),
    card: eagerComponent(CardComponent),
    chart: lazyComponent(
      () => import("./chart") as unknown as Promise<RendererComponentModule<"chart">>,
    ),
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
  },
  name: "lattice/core",
});
