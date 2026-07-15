import {
  createPlugin,
  eagerComponent,
  type ComponentRegistryFor,
} from "@lattice-php/lattice/core/registry";
import type { ActionNodeType, FormNodeType, NodeType } from "@lattice-php/lattice/types/generated";
import type { ChatComponentType } from "@lattice-php/lattice/chat/plugin";
import type { LayoutComponentType } from "@lattice-php/lattice/layout/plugin";
import type { NotificationsComponentType } from "@lattice-php/lattice/notifications/plugin";
import type { RemoteComponentType } from "@lattice-php/lattice/remote/plugin";
import type { TableComponentType } from "@lattice-php/lattice/table/plugin";
import AvatarComponent from "./avatar";
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
import ImageComponent from "./image";
import LinkComponent from "./link";
import ModalComponent from "./modal";
import ProgressComponent from "./progress";
import RawBlockComponent from "./raw-block";
import SectionComponent from "./section";
import SegmentedControlComponent from "./segmented-control";
import SeparatorComponent from "./separator";
import StackComponent from "./stack";
import TabComponent, { TabsComponent } from "./tabs";
import TextComponent from "./text";
import TooltipComponent from "./tooltip";
import TreeComponent from "./tree";

type NonUiComponentType =
  | ActionNodeType
  | ChatComponentType
  | FormNodeType
  | LayoutComponentType
  | NotificationsComponentType
  | RemoteComponentType
  | TableComponentType;

type UiComponentType = Exclude<NodeType, NonUiComponentType>;

export const uiComponents = createPlugin({
  components: {
    avatar: eagerComponent(AvatarComponent),
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
    tree: eagerComponent(TreeComponent),
  } satisfies ComponentRegistryFor<UiComponentType>,
  name: "lattice/ui",
});
