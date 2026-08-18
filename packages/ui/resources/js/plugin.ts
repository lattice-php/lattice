import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { UiNodeType } from "./generated";
import { UI_NAMESPACE } from "./i18n";
import AvatarComponent from "./components/avatar";
import BadgeComponent from "./components/badge";
import ButtonComponent from "./components/button";
import CardComponent from "./components/card";
import ChartComponent from "./components/chart";
import CodeBlockComponent from "./components/code-block";
import CollapsibleAdapter from "./components/collapsible/collapsible-adapter";
import DescriptionListComponent from "./components/description-list";
import FloatingPanelComponent from "./components/floating-panel";
import GridAdapter from "./components/grid/grid-adapter";
import HeadingAdapter from "./components/heading/heading-adapter";
import IconComponent from "./components/icon";
import ImageComponent from "./components/image";
import LinkComponent from "./components/link";
import ModalComponent from "./components/modal";
import ProgressComponent from "./components/progress";
import RawBlockComponent from "./components/raw-block";
import SectionComponent from "./components/section";
import SegmentedControlComponent from "./components/segmented-control";
import SeparatorAdapter from "./components/separator/separator-adapter";
import StackAdapter from "./components/stack/stack-adapter";
import TabComponent, { TabsComponent } from "./components/tabs";
import TextAdapter from "./components/text/text-adapter";
import TooltipComponent from "./components/tooltip";
import {
  BadgeEntryComponent,
  BooleanEntryComponent,
  ComponentEntryComponent,
  DateEntryComponent,
  TextEntryComponent,
} from "./entries";

export const uiComponents: Plugin = {
  components: {
    avatar: eagerComponent(AvatarComponent),
    badge: eagerComponent(BadgeComponent),
    button: eagerComponent(ButtonComponent),
    card: eagerComponent(CardComponent),
    chart: eagerComponent(ChartComponent),
    "code-block": eagerComponent(CodeBlockComponent),
    collapsible: eagerComponent(CollapsibleAdapter),
    "description-list": eagerComponent(DescriptionListComponent),
    "entry.badge": eagerComponent(BadgeEntryComponent),
    "entry.boolean": eagerComponent(BooleanEntryComponent),
    "entry.component": eagerComponent(ComponentEntryComponent),
    "entry.date": eagerComponent(DateEntryComponent),
    "entry.text": eagerComponent(TextEntryComponent),
    "floating-panel": eagerComponent(FloatingPanelComponent),
    grid: eagerComponent(GridAdapter),
    heading: eagerComponent(HeadingAdapter),
    icon: eagerComponent(IconComponent),
    image: eagerComponent(ImageComponent),
    link: eagerComponent(LinkComponent),
    modal: eagerComponent(ModalComponent),
    progress: eagerComponent(ProgressComponent),
    "raw-block": eagerComponent(RawBlockComponent),
    section: eagerComponent(SectionComponent),
    "segmented-control": eagerComponent(SegmentedControlComponent),
    separator: eagerComponent(SeparatorAdapter),
    stack: eagerComponent(StackAdapter),
    tab: eagerComponent(TabComponent),
    tabs: eagerComponent(TabsComponent),
    text: eagerComponent(TextAdapter),
    tooltip: eagerComponent(TooltipComponent),
  } satisfies ComponentRegistryFor<UiNodeType>,
  i18n: { namespace: UI_NAMESPACE },
  name: "lattice/ui",
};
