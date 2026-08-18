import type { Affix, Breadcrumb, Node, RemoteAccess } from "@lattice-php/core";
import type { HttpMethod, Placement, Size, Translatable, Variant } from "@lattice-php/ui";
import type { Effect } from "@lattice-php/ui/effects/types";

export type ActionNodeType = "action" | "action.bulk" | "action.group";
export type Breadcrumbs = Record<string, never>;
export type CalendarNodeType = "calendar";
export type Callouts = Record<string, never>;
export type ChannelVisibility = "public" | "private" | "presence";
export type ChatNodeType = "chat.box" | "chat.part.text" | "chat.part.tool-call";
export type ColumnNodeType =
  | "column.badge"
  | "column.boolean"
  | "column.icon"
  | "column.image"
  | "column.money"
  | "column.number"
  | "column.stack"
  | "column.text";
export type ComponentPropsMap = {
  breadcrumbs: Breadcrumbs;
  callouts: Callouts;
  dropdown: Dropdown;
  fragment: Fragment;
  menu: Menu;
  "menu-item": MenuItem;
  notifications: Notifications;
  outlet: Outlet;
  "remote.data-list": DataList;
  sidebar: Sidebar;
  "sidebar.footer": SidebarFooter;
  topbar: Topbar;
};
export type DataList = {
  dataEndpoint: string | null;
  emptyLabel: string | null;
  remote: RemoteAccess | null;
};
export type Dropdown = {
  placement: Placement;
  trigger: Node[];
};
export type FilterNodeType =
  | "filter.date-range"
  | "filter.media-type"
  | "filter.select"
  | "filter.ternary"
  | "filter.toggle";
export type FormFieldNodeType =
  | "field.builder"
  | "field.checkbox"
  | "field.choice"
  | "field.color-picker"
  | "field.date-input"
  | "field.date-time-input"
  | "field.file-upload"
  | "field.hidden-input"
  | "field.media-picker"
  | "field.number-input"
  | "field.otp"
  | "field.password-input"
  | "field.pattern-input"
  | "field.repeater"
  | "field.rich-editor"
  | "field.select"
  | "field.text-input"
  | "field.textarea"
  | "field.time-input"
  | "field.toggle"
  | "wizard"
  | "wizard-step";
export type FormNodeType =
  | "field.builder"
  | "field.checkbox"
  | "field.choice"
  | "field.color-picker"
  | "field.date-input"
  | "field.date-time-input"
  | "field.file-upload"
  | "field.hidden-input"
  | "field.media-picker"
  | "field.number-input"
  | "field.otp"
  | "field.password-input"
  | "field.pattern-input"
  | "field.repeater"
  | "field.rich-editor"
  | "field.select"
  | "field.text-input"
  | "field.textarea"
  | "field.time-input"
  | "field.toggle"
  | "form"
  | "wizard"
  | "wizard-step";
export type Fragment = {
  endpoint: string | null;
  lazy: boolean;
  ref: string | null;
  size: Size;
};
export type FragmentNodeType = "fragment";
export type FragmentResponse = {
  readonly schema: Node[];
};
export type I18nConfig = {
  readonly enabled: boolean;
  readonly locales: string[];
  readonly preloadLocales: string[];
  readonly saveMissing: boolean;
  readonly timezone: string | null;
};
export type LayoutNodeType =
  | "breadcrumbs"
  | "callouts"
  | "dropdown"
  | "menu"
  | "menu-item"
  | "outlet"
  | "sidebar"
  | "sidebar.footer"
  | "topbar";
export type Listen = {
  readonly channel: string;
  effects: Effect[];
  events: string[];
  readonly visibility: ChannelVisibility;
};
export type MapNodeType = "map";
export type MediumNodeType = "media.library";
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
export type NodeType =
  | "action"
  | "action.bulk"
  | "action.group"
  | "api-reference"
  | "avatar"
  | "badge"
  | "breadcrumbs"
  | "button"
  | "calendar"
  | "callouts"
  | "card"
  | "chart"
  | "chat.box"
  | "chat.part.text"
  | "chat.part.tool-call"
  | "code-block"
  | "collapsible"
  | "description-list"
  | "dropdown"
  | "entry.badge"
  | "entry.boolean"
  | "entry.component"
  | "entry.date"
  | "entry.text"
  | "field.builder"
  | "field.checkbox"
  | "field.choice"
  | "field.color-picker"
  | "field.date-input"
  | "field.date-time-input"
  | "field.file-upload"
  | "field.hidden-input"
  | "field.media-picker"
  | "field.number-input"
  | "field.otp"
  | "field.password-input"
  | "field.pattern-input"
  | "field.repeater"
  | "field.rich-editor"
  | "field.select"
  | "field.text-input"
  | "field.textarea"
  | "field.time-input"
  | "field.toggle"
  | "floating-panel"
  | "form"
  | "fragment"
  | "grid"
  | "heading"
  | "icon"
  | "image"
  | "link"
  | "map"
  | "media.library"
  | "menu"
  | "menu-item"
  | "modal"
  | "notifications"
  | "outlet"
  | "pdf"
  | "progress"
  | "raw-block"
  | "remote.data-list"
  | "search.box"
  | "search.categories"
  | "search.input"
  | "search.preview"
  | "search.recent"
  | "search.results"
  | "section"
  | "segmented-control"
  | "separator"
  | "sidebar"
  | "sidebar.footer"
  | "signature"
  | "stack"
  | "tab"
  | "table"
  | "tabs"
  | "text"
  | "tooltip"
  | "topbar"
  | "tree"
  | "wizard"
  | "wizard-step";
export type NotificationItem = {
  readonly actions: Node[];
  readonly body: Translatable | string | null;
  readonly createdAt: string | null;
  readonly href: string | null;
  readonly icon: string | null;
  readonly id: string;
  readonly isRead: boolean;
  readonly title: Translatable | string | null;
  readonly variant: Variant | null;
};
export type NotificationList = {
  readonly hasMore: boolean;
  readonly notifications: NotificationItem[];
  readonly unreadCount: number;
};
export type NotificationNodeType = "notifications";
export type Notifications = {
  channel: string;
  endpoint: string;
  pollingInterval: number | null;
  slideOut: boolean;
};
export type Outlet = Record<string, never>;
export type PageLayoutPayload = {
  readonly key: string;
  readonly schema: Node[];
};
export type PagePayload = {
  readonly breadcrumbs: Breadcrumb[];
  readonly layout: PageLayoutPayload | null;
  readonly listeners: Listen[];
  readonly schema: Node[];
  readonly title: string | null;
  readonly width: string;
};
export type PdfNodeType = "pdf";
export type RemoteNodeType = "remote.data-list";
export type SearchNodeType =
  | "search.box"
  | "search.categories"
  | "search.input"
  | "search.preview"
  | "search.recent"
  | "search.results";
export type Sidebar = {
  collapsible: boolean;
  rememberState: boolean;
};
export type SidebarFooter = Record<string, never>;
export type SignatureExampleNodeType = "signature";
export type TableNodeType = "table";
export type Topbar = {
  sticky: boolean;
};
export type UiNodeType =
  | "avatar"
  | "badge"
  | "button"
  | "card"
  | "chart"
  | "code-block"
  | "collapsible"
  | "description-list"
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
  | "modal"
  | "progress"
  | "raw-block"
  | "section"
  | "segmented-control"
  | "separator"
  | "stack"
  | "tab"
  | "tabs"
  | "text"
  | "tooltip";
export type UnreadCount = {
  readonly unreadCount: number;
};
