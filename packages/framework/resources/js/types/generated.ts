import type { Breadcrumb, Node, RemoteAccess } from "@lattice-php/core";
import type { Size, Translatable, Variant } from "@lattice-php/ui";
import type { Effect } from "@lattice-php/ui/effects/types";

export type ActionNodeType = "action" | "action.bulk" | "action.group";
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
  callouts: Callouts;
  fragment: Fragment;
  notifications: Notifications;
  outlet: Outlet;
  "remote.data-list": DataList;
};
export type DataList = {
  dataEndpoint: string | null;
  emptyLabel: string | null;
  remote: RemoteAccess | null;
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
  | "field.tree"
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
  | "field.tree"
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
export type LayoutNodeType = "callouts" | "outlet";
export type Listen = {
  readonly channel: string;
  effects: Effect[];
  events: string[];
  readonly visibility: ChannelVisibility;
};
export type MapNodeType = "map";
export type MediumNodeType = "media.library";
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
  | "field.tree"
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
  | "popover"
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
export type SignatureExampleNodeType = "signature";
export type TableNodeType = "table";
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
export type UnreadCount = {
  readonly unreadCount: number;
};
