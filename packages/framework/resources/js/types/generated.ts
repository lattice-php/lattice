import type { Affix, Breadcrumb, Node } from "@lattice-php/core";
import type { HttpMethod, Placement, Size, Translatable, Variant } from "@lattice-php/ui";
import type { Effect } from "@lattice-php/ui/effects/types";

export type ActionNodeType = "action" | "action.bulk" | "action.group";
export type Breadcrumbs = Record<string, never>;
export type BrowserToken = {
  readonly accessToken: string;
  readonly audience: string;
  readonly expiresIn: number;
  readonly scopes: string[];
  readonly tokenType: string;
};
export type Callouts = Record<string, never>;
export type ChannelVisibility = "public" | "private" | "presence";
export type ChatBox = {
  fill: boolean;
  historyEndpoint: string | null;
  placeholder: string | null;
  remote: RemoteAccess | null;
  streamEndpoint: string | null;
  title: string | null;
};
export type ChatMessage = {
  readonly id: string;
  readonly parts: Node[];
  readonly role: ChatRole;
};
export type ChatNodeType = "chat.box" | "chat.part.text" | "chat.part.tool-call";
export type ChatRole = "user" | "assistant" | "system";
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
  "chat.box": ChatBox;
  "chat.part.text": TextPart;
  "chat.part.tool-call": ToolCallPart;
  dropdown: Dropdown;
  fragment: Fragment;
  menu: Menu;
  "menu-item": MenuItem;
  notifications: Notifications;
  outlet: Outlet;
  "remote.data-list": DataList;
  sidebar: Sidebar;
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
  | "topbar";
export type Listen = {
  readonly channel: string;
  effects: Effect[];
  events: string[];
  readonly visibility: ChannelVisibility;
};
export type MediumNodeType = "media.library";
export type Menu = Record<string, never>;
export type MenuItem = {
  action: Node | null;
  effects: Effect[];
  href: string | null;
  icon: string | null;
  label: string | null;
  method: HttpMethod | null;
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
  | "callouts"
  | "card"
  | "chart"
  | "chat.box"
  | "chat.part.text"
  | "chat.part.tool-call"
  | "code-block"
  | "collapsible"
  | "dropdown"
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
  | "media.library"
  | "menu"
  | "menu-item"
  | "modal"
  | "notifications"
  | "outlet"
  | "progress"
  | "raw-block"
  | "remote.data-list"
  | "section"
  | "segmented-control"
  | "separator"
  | "sidebar"
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
  readonly container: string;
  readonly layout: PageLayoutPayload | null;
  readonly listeners: Listen[];
  readonly schema: Node[];
  readonly title: string | null;
};
export type RemoteAccess = {
  readonly audience: string;
  readonly nodeId: string;
  readonly nodeType: string;
  readonly ref: string;
  readonly scopes: string[];
  readonly source: string;
  readonly tokenEndpoint: string;
};
export type RemoteNodeType = "remote.data-list";
export type Sidebar = {
  collapsible: boolean;
  rememberState: boolean;
};
export type SignatureExampleNodeType = "signature";
export type TableNodeType = "table";
export type TextPart = {
  text: string;
};
export type ToolCallPart = {
  args: Record<string, unknown>;
  name: string;
};
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
