import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { UiNodeType } from "./generated";
import { UI_NAMESPACE } from "./i18n";
import AvatarAdapter from "./components/avatar/avatar-adapter";
import BadgeComponent from "./components/badge";
import ButtonComponent from "./components/button";
import CardAdapter from "./components/card/card-adapter";
import ChartComponent from "./components/chart";
import CodeBlockAdapter from "./components/code-block/code-block-adapter";
import CollapsibleAdapter from "./components/collapsible/collapsible-adapter";
import DescriptionListAdapter from "./components/description-list/description-list-adapter";
import FloatingPanelAdapter from "./components/floating-panel/floating-panel-adapter";
import GridAdapter from "./components/grid/grid-adapter";
import HeadingAdapter from "./components/heading/heading-adapter";
import IconComponent from "./components/icon";
import ImageAdapter from "./components/image/image-adapter";
import LinkComponent from "./components/link";
import ModalComponent from "./components/modal";
import ProgressAdapter from "./components/progress/progress-adapter";
import RawBlockComponent from "./components/raw-block";
import SectionAdapter from "./components/section/section-adapter";
import SegmentedControlAdapter from "./components/segmented-control/segmented-control-adapter";
import SeparatorAdapter from "./components/separator/separator-adapter";
import StackAdapter from "./components/stack/stack-adapter";
import TabAdapter, { TabsAdapter } from "./components/tabs/tabs-adapter";
import TextAdapter from "./components/text/text-adapter";
import TooltipAdapter from "./components/tooltip/tooltip-adapter";
import {
  BadgeEntryComponent,
  BooleanEntryComponent,
  ComponentEntryComponent,
  DateEntryComponent,
  TextEntryComponent,
} from "./entries";

export const uiComponents: Plugin = {
  components: {
    avatar: eagerComponent(AvatarAdapter),
    badge: eagerComponent(BadgeComponent),
    button: eagerComponent(ButtonComponent),
    card: eagerComponent(CardAdapter),
    chart: eagerComponent(ChartComponent),
    "code-block": eagerComponent(CodeBlockAdapter),
    collapsible: eagerComponent(CollapsibleAdapter),
    "description-list": eagerComponent(DescriptionListAdapter),
    "entry.badge": eagerComponent(BadgeEntryComponent),
    "entry.boolean": eagerComponent(BooleanEntryComponent),
    "entry.component": eagerComponent(ComponentEntryComponent),
    "entry.date": eagerComponent(DateEntryComponent),
    "entry.text": eagerComponent(TextEntryComponent),
    "floating-panel": eagerComponent(FloatingPanelAdapter),
    grid: eagerComponent(GridAdapter),
    heading: eagerComponent(HeadingAdapter),
    icon: eagerComponent(IconComponent),
    image: eagerComponent(ImageAdapter),
    link: eagerComponent(LinkComponent),
    modal: eagerComponent(ModalComponent),
    progress: eagerComponent(ProgressAdapter),
    "raw-block": eagerComponent(RawBlockComponent),
    section: eagerComponent(SectionAdapter),
    "segmented-control": eagerComponent(SegmentedControlAdapter),
    separator: eagerComponent(SeparatorAdapter),
    stack: eagerComponent(StackAdapter),
    tab: eagerComponent(TabAdapter),
    tabs: eagerComponent(TabsAdapter),
    text: eagerComponent(TextAdapter),
    tooltip: eagerComponent(TooltipAdapter),
  } satisfies ComponentRegistryFor<UiNodeType>,
  i18n: { namespace: UI_NAMESPACE },
  name: "lattice/ui",
};
