import type { Affix, Breadcrumb, Color, Node, Option } from "@lattice-php/core";
import type { Effect } from "@lattice-php/ui/effects/types";

export type Align = "center" | "left" | "start" | "stretch";
export type Avatar = {
  name: string | null;
  shape: AvatarShape;
  size: Size;
  src: string | null;
};
export type AvatarShape = "circle" | "rounded";
export type Badge = {
  color: Color | null;
  label: string;
};
export type BadgeEntry = {
  color: Color | null;
  description: string | null;
  label: string | null;
  name: string;
  value: unknown;
};
export type BooleanEntry = {
  description: string | null;
  falseIcon: string;
  label: string | null;
  name: string;
  trueIcon: string;
  value: unknown;
};
export type Breadcrumbs = {
  items: Breadcrumb[];
};
export type Breakpoint = "default" | "sm" | "md" | "lg" | "xl" | "2xl";
export type Button = {
  action: Node | null;
  buttonType: ButtonType;
  effects: Effect[];
  emphasis: Emphasis | null;
  href: string | null;
  icon: string | null;
  label: string | null;
  method: HttpMethod | null;
  modal: Node<"modal"> | null;
  variant: Variant | null;
};
export type ButtonType = "button" | "submit" | "reset";
export type Callout = {
  action: Node | null;
  dismissible: boolean;
  message: Translatable | string;
  title: Translatable | string | null;
  unique: string | null;
  variant: Variant;
};
export type Card = {
  description: string | null;
  headerActions: Node[];
  title: string | null;
  tooltip: string | null;
};
export type Chart = {
  categoryFormat: DateFormat | NumberFormat | null;
  categoryKey: string | null;
  data: Record<string, unknown>[];
  description: string | null;
  grid: boolean;
  height: number;
  legend: boolean;
  series: ChartSeries[];
  title: string | null;
  tooltip: boolean;
  valueFormat: NumberFormat | null;
  xAxis: boolean;
  yAxis: boolean;
};
export type ChartSeries = {
  readonly color: Color | null;
  readonly dataKey: string;
  readonly innerRadius: string;
  readonly maxValue: number | null;
  readonly name: string;
  readonly nameKey: string | null;
  readonly stackId: string | null;
  readonly type: ChartSeriesType;
};
export type ChartSeriesType = "area" | "bar" | "distribution" | "gauge" | "line" | "pie";
export type CloseModal = {
  readonly modal: string | null;
};
export type CodeBlock = {
  code: string;
  copyable: boolean;
  language: CodeBlockLanguage;
  lineNumbers: boolean;
  maxHeight: number | null;
  wrap: boolean;
};
export type CodeBlockLanguage = "text" | "json" | "javascript" | "shell" | "php";
export type Collapsible = {
  collapsed: boolean;
  rememberState: boolean;
  tooltip: string | null;
  trigger: Node[];
};
export type ColumnWidth = "xs" | "sm" | "md" | "lg" | "xl";
export type ComponentEntry = {
  description: string | null;
  label: string | null;
  name: string;
  value: unknown;
};
export type ComponentPropsMap = {
  avatar: Avatar;
  badge: Badge;
  breadcrumbs: Breadcrumbs;
  button: Button;
  card: Card;
  chart: Chart;
  "code-block": CodeBlock;
  collapsible: Collapsible;
  "description-list": DescriptionList;
  dropdown: Dropdown;
  "entry.badge": BadgeEntry;
  "entry.boolean": BooleanEntry;
  "entry.component": ComponentEntry;
  "entry.date": DateEntry;
  "entry.text": TextEntry;
  "floating-panel": FloatingPanel;
  grid: Grid;
  heading: Heading;
  icon: Icon;
  image: Image;
  link: Link;
  menu: Menu;
  "menu-item": MenuItem;
  modal: Modal;
  popover: Popover;
  progress: Progress;
  "raw-block": RawBlock;
  section: Section;
  "segmented-control": SegmentedControl;
  separator: Separator;
  sidebar: Sidebar;
  "sidebar.footer": SidebarFooter;
  stack: Stack;
  tab: Tab;
  tabs: Tabs;
  text: Text;
  tooltip: Tooltip;
  topbar: Topbar;
};
export type DateEntry = {
  description: string | null;
  format: DateFormat;
  label: string | null;
  name: string;
  value: unknown;
};
export type DateFormat = {
  dateStyle: DateTimeStyle | null;
  kind: string;
  month: string | null;
  timeStyle: DateTimeStyle | null;
  year: string | null;
};
export type DateTimeStyle = "full" | "long" | "medium" | "short";
export type DescriptionList = {
  bleed: boolean;
  divided: boolean;
  emptyLabel: string | null;
  semantic: string;
};
export type Download = {
  readonly url: string;
};
export type Dropdown = {
  placement: Placement;
  trigger: Node[];
};
export type EffectPropsMap = {
  callout: Callout;
  "close-modal": CloseModal;
  download: Download;
  "locale-change": LocaleChange;
  "open-modal": OpenModal;
  redirect: Redirect;
  "reload-component": ReloadComponent;
  "reload-page": ReloadPage;
  "reset-form": ResetForm;
  "retract-callout": RetractCallout;
  toast: Toast;
  "toggle-sidebar": ToggleSidebar;
};
export type Emphasis = "solid" | "outline" | "ghost" | "link";
export type FloatingPanel = {
  label: string | null;
  offset: number;
  placement: FloatingPlacement;
  trigger: Node[];
};
export type FloatingPlacement = "bottom-end" | "bottom-start" | "top-end" | "top-start";
export type Gap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type Grid = {
  columns: Record<string, number | string> | null;
};
export type Heading = {
  copyable: boolean;
  level: number;
  text: string;
  tooltip: string | null;
};
export type Height = "full" | "screen";
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
export type Icon = {
  class: string | null;
  color: Color | null;
  name: string;
  size: Size;
};
export type Image = {
  alt: string | null;
  circular: boolean;
  previewable: boolean;
  size: number | null;
  src: string;
};
export type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type Link = {
  action: Node | null;
  effects: Effect[];
  href: string | null;
  icon: string | null;
  label: string | null;
  method: HttpMethod | null;
  modal: Node<"modal"> | null;
  prefix: Affix | null;
  suffix: Affix | null;
  tabIndex: number | null;
};
export type LocaleChange = {
  readonly locale: string;
};
export type Menu = Record<string, never>;
export type MenuItem = {
  action: Node | null;
  effects: Effect[];
  href: string | null;
  icon: string | null;
  label: string | null;
  method: HttpMethod | null;
  modal: Node<"modal"> | null;
  prefix: Affix | null;
  suffix: Affix | null;
};
export type Modal = {
  closeLabel: string;
  description: string | null;
  height: ModalHeight;
  side: Side | null;
  title: string | null;
  width: ModalWidth;
};
export type ModalHeight = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type ModalWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type NodeType =
  | "avatar"
  | "badge"
  | "breadcrumbs"
  | "button"
  | "card"
  | "chart"
  | "code-block"
  | "collapsible"
  | "description-list"
  | "dropdown"
  | "entry.badge"
  | "entry.boolean"
  | "entry.component"
  | "entry.date"
  | "entry.text"
  | "floating-panel"
  | "grid"
  | "heading"
  | "icon"
  | "image"
  | "link"
  | "menu"
  | "menu-item"
  | "modal"
  | "popover"
  | "progress"
  | "raw-block"
  | "section"
  | "segmented-control"
  | "separator"
  | "sidebar"
  | "sidebar.footer"
  | "stack"
  | "tab"
  | "tabs"
  | "text"
  | "tooltip"
  | "topbar";
export type NumberFormat = {
  currency: string | null;
  kind: string;
  maximumFractionDigits: number | null;
  minimumFractionDigits: number | null;
  notation: string;
  unit: NumberFormatUnit | null;
};
export type NumberFormatUnit =
  | "percent"
  | "kilogram"
  | "gram"
  | "kilometer"
  | "meter"
  | "byte"
  | "kilobyte"
  | "megabyte"
  | "gigabyte"
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "celsius"
  | "fahrenheit";
export type OpenModal = {
  readonly node: Node<"modal">;
};
export type Orientation = "horizontal" | "vertical";
export type Placement = "top" | "bottom" | "right";
export type Popover = {
  align: PopoverAlign;
  label: string | null;
  side: PopoverSide;
  trigger: Node[];
};
export type PopoverAlign = "start" | "center" | "end";
export type PopoverSide = "top" | "right" | "bottom" | "left";
export type Progress = {
  color: Color | null;
  max: number;
  shape: ProgressShape;
  showValue: boolean;
  size: Size;
  value: number;
};
export type ProgressShape = "bar" | "circle";
export type RawBlock = {
  html: string;
};
export type Redirect = {
  readonly url: string;
};
export type ReloadComponent = {
  readonly component: string;
};
export type ReloadPage = {
  readonly full: boolean;
};
export type ResetForm = {
  readonly form: string | null;
};
export type RetractCallout = {
  readonly unique: string;
};
export type Section = {
  collapsed: boolean;
  collapsible: boolean;
  description: string | null;
  headerActions: Node[];
  rememberState: boolean;
  title: string | null;
  tooltip: string | null;
};
export type SegmentedControl = {
  emits: string | null;
  label: string | null;
  name: string;
  options: Option[];
  value: string | null;
};
export type Separator = {
  bleed: boolean;
  orientation: Orientation;
};
export type Side = "start" | "end";
export type Sidebar = {
  collapsible: boolean;
  rememberState: boolean;
};
export type SidebarFooter = Record<string, never>;
export type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
export type Stack = {
  align: Align | null;
  direction: StackDirection | null;
  float: Side | null;
  gap: Gap | null;
  height: Height | null;
  justify: Justify | null;
  sticky: boolean;
  width: Width | null;
};
export type StackDirection = "row" | "column";
export type Tab = {
  confirm: {
    redirectUrl: string;
    required: boolean;
    timeout: number | null;
  } | null;
  label: string;
  value: string;
};
export type Tabs = {
  activeValue: string;
  alignment: TabsAlignment;
  defaultValue: string | null;
  orientation: Orientation;
  queryKey: string;
  sticky: boolean;
};
export type TabsAlignment = "start" | "center" | "end" | "stretch";
export type Text = {
  align: Align | null;
  color: Color | null;
  copyable: boolean;
  size: Size;
  text: string;
};
export type TextEntry = {
  copyable: boolean;
  description: string | null;
  label: string | null;
  name: string;
  placeholder: string | null;
  value: unknown;
};
export type Toast = {
  action: Node | null;
  dismissible: boolean;
  duration: number | null;
  message: Translatable | string;
  persistent: boolean;
  variant: Variant;
};
export type ToggleSidebar = {
  readonly target: string | null;
};
export type Tooltip = {
  content: string | null;
  trigger: Node[];
};
export type Topbar = {
  sticky: boolean;
};
export type Translatable = {
  key: string;
  payload: Record<string, string>;
  replacements: Record<string, boolean | number | string>;
};
export type UiNodeType =
  | "avatar"
  | "badge"
  | "breadcrumbs"
  | "button"
  | "card"
  | "chart"
  | "code-block"
  | "collapsible"
  | "description-list"
  | "dropdown"
  | "entry.badge"
  | "entry.boolean"
  | "entry.component"
  | "entry.date"
  | "entry.text"
  | "floating-panel"
  | "grid"
  | "heading"
  | "icon"
  | "image"
  | "link"
  | "menu"
  | "menu-item"
  | "modal"
  | "popover"
  | "progress"
  | "raw-block"
  | "section"
  | "segmented-control"
  | "separator"
  | "sidebar"
  | "sidebar.footer"
  | "stack"
  | "tab"
  | "tabs"
  | "text"
  | "tooltip"
  | "topbar";
export type Variant = "primary" | "secondary" | "success" | "info" | "warning" | "danger";
export type Width = "full" | "auto" | "sm" | "md" | "lg" | "xl" | "fill";
