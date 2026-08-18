import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { UiNodeType } from "./generated";
import { UI_NAMESPACE } from "./i18n";
import AvatarAdapter from "./components/avatar/avatar-adapter";
import BadgeAdapter from "./components/badge/badge-adapter";
import ButtonAdapter from "./components/button/button-adapter";
import CardAdapter from "./components/card/card-adapter";
import ChartAdapter from "./components/chart/chart-adapter";
import CodeBlockAdapter from "./components/code-block/code-block-adapter";
import CollapsibleAdapter from "./components/collapsible/collapsible-adapter";
import DescriptionListAdapter from "./components/description-list/description-list-adapter";
import FloatingPanelAdapter from "./components/floating-panel/floating-panel-adapter";
import GridAdapter from "./components/grid/grid-adapter";
import HeadingAdapter from "./components/heading/heading-adapter";
import IconAdapter from "./components/icon/icon-adapter";
import ImageAdapter from "./components/image/image-adapter";
import LinkAdapter from "./components/link/link-adapter";
import ModalAdapter from "./components/modal/modal-adapter";
import ProgressAdapter from "./components/progress/progress-adapter";
import RawBlockAdapter from "./components/raw-block/raw-block-adapter";
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
    badge: eagerComponent(BadgeAdapter),
    button: eagerComponent(ButtonAdapter),
    card: eagerComponent(CardAdapter),
    chart: eagerComponent(ChartAdapter),
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
    icon: eagerComponent(IconAdapter),
    image: eagerComponent(ImageAdapter),
    link: eagerComponent(LinkAdapter),
    modal: eagerComponent(ModalAdapter),
    progress: eagerComponent(ProgressAdapter),
    "raw-block": eagerComponent(RawBlockAdapter),
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
