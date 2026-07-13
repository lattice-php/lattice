import type { Node } from "@lattice-php/lattice/core/types";
export type Action = {
  confirmation: Confirmation | null;
  endpoint: string | null;
  form: Node<"form"> | null;
  icon: string | null;
  label: string | null;
  lazyForm: boolean;
  method: HttpMethod | null;
  ref: string | null;
  variant: ButtonVariant | null;
};
export type ActionGroup = {
  label: string | null;
  orientation: Orientation | null;
  ref: string | null;
};
export type ActionNodeType = "action" | "action.bulk" | "action.group";
export type ActionResult = {
  readonly ok: boolean;
  readonly data: Record<string, unknown>;
  readonly effects: Effect[];
};
export type Affix = {
  readonly icon: string | null;
  readonly text: string | null;
};
export type Align = "center" | "left" | "start" | "stretch";
export type Avatar = {
  name: string | null;
  size: Size;
  src: string | null;
};
export type Badge = {
  label: string;
};
export type BadgeColumn = {
  align: ColumnAlign;
  colors: Record<string | number, string> | null;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type BooleanColumn = {
  align: ColumnAlign;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type Breadcrumbs = Record<string, never>;
export type BrowserToken = {
  readonly accessToken: string;
  readonly tokenType: string;
  readonly expiresIn: number;
  readonly audience: string;
  readonly scopes: string[];
};
export type Builder = {
  addLabel: string | null;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  defaultItems: number;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  layout: RowLayout;
  maxItems: number | null;
  minItems: number | null;
  name: string;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  reorderable: boolean;
  required: boolean;
  resizableColumns: boolean;
  resizeIndicator: boolean;
  rowActions: RowAction[] | null;
  tooltip: string | null;
  value: unknown;
};
export type BulkAction = {
  confirmation: Confirmation | null;
  endpoint: string | null;
  form: Node<"form"> | null;
  icon: string | null;
  label: string | null;
  lazyForm: boolean;
  method: HttpMethod | null;
  ref: string | null;
  variant: ButtonVariant | null;
};
export type Button = {
  action: Node<"action"> | null;
  buttonType: ButtonType;
  effects: Effect[];
  href: string | null;
  icon: string | null;
  label: string | null;
  method: HttpMethod | null;
  variant: ButtonVariant | null;
};
export type ButtonType = "button" | "submit" | "reset";
export type ButtonVariant =
  | "default"
  | "destructive"
  | "ghost"
  | "info"
  | "link"
  | "outline"
  | "secondary"
  | "success";
export type Callout = {
  variant: Variant;
  message: string;
  title: string | null;
  dismissible: boolean;
  action: Node | null;
};
export type Callouts = Record<string, never>;
export type Card = {
  description: string | null;
  title: string | null;
  tooltip: string | null;
};
export type ChannelVisibility = "public" | "private" | "presence";
export type Chart = {
  categoryFormat: NumberFormat | DateFormat | null;
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
  readonly type: ChartSeriesType;
  readonly dataKey: string;
  readonly name: string;
  readonly color: string | null;
  readonly stackId: string | null;
  readonly nameKey: string | null;
  readonly innerRadius: string;
};
export type ChartSeriesType = "area" | "bar" | "line" | "pie";
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
  readonly role: ChatRole;
  readonly parts: Node[];
};
export type ChatRole = "user" | "assistant" | "system";
export type Checkbox = {
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  name: string;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  tabIndex: number | null;
  tooltip: string | null;
  value: unknown;
};
export type Choice = {
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  name: string;
  options: Option[];
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  tabIndex: number | null;
  tooltip: string | null;
  value: unknown;
};
export type CloseModal = {
  readonly modal: string | null;
};
export type Collapsible = {
  collapsed: boolean;
  rememberState: boolean;
  tooltip: string | null;
  trigger: Node[];
};
export type Color = "default" | "muted" | "primary" | "success" | "info" | "warning" | "danger";
export type ColumnAlign = "start" | "center" | "end";
export type ColumnFilter = {
  readonly type: FilterType;
  readonly operators: Op[];
  readonly defaultOperator: Op;
  readonly control: FilterControl | null;
  readonly options: Option[];
  readonly multiple: boolean;
  readonly searchable: boolean;
  readonly clauseOptions: ColumnFilterOption[];
};
export type ColumnFilterOption = {
  readonly label: string;
  readonly value: string;
  readonly clauses: ColumnFilterOptionClause[];
};
export type ColumnFilterOptionClause = {
  readonly operator: Op;
  readonly value: string;
};
export type ColumnPropsMap = {
  "column.badge": BadgeColumn;
  "column.boolean": BooleanColumn;
  "column.icon": IconColumn;
  "column.image": ImageColumn;
  "column.money": MoneyColumn;
  "column.number": NumberColumn;
  "column.stack": StackColumn;
  "column.text": TextColumn;
};
export type ColumnType =
  | "column.text"
  | "column.boolean"
  | "column.number"
  | "column.money"
  | "column.stack"
  | "column.badge"
  | "column.icon"
  | "column.image";
export type ColumnWidth = "xs" | "sm" | "md" | "lg" | "xl";
export type ComponentPropsMap = {
  action: Action;
  "action.bulk": BulkAction;
  "action.group": ActionGroup;
  avatar: Avatar;
  badge: Badge;
  breadcrumbs: Breadcrumbs;
  button: Button;
  callouts: Callouts;
  card: Card;
  chart: Chart;
  "chat.box": ChatBox;
  "chat.part.text": TextPart;
  "chat.part.tool-call": ToolCallPart;
  collapsible: Collapsible;
  dropdown: Dropdown;
  "field.builder": Builder;
  "field.checkbox": Checkbox;
  "field.choice": Choice;
  "field.date-input": DateInput;
  "field.date-time-input": DateTimeInput;
  "field.file-upload": FileUpload;
  "field.hidden-input": HiddenInput;
  "field.number-input": NumberInput;
  "field.otp": OtpInput;
  "field.password-input": PasswordInput;
  "field.repeater": Repeater;
  "field.rich-editor": RichEditor;
  "field.select": Select;
  "field.text-input": TextInput;
  "field.textarea": Textarea;
  "field.time-input": TimeInput;
  "field.toggle": Toggle;
  "floating-panel": FloatingPanel;
  form: Form;
  fragment: Fragment;
  grid: Grid;
  heading: Heading;
  icon: Icon;
  link: Link;
  menu: Menu;
  "menu-item": MenuItem;
  modal: Modal;
  notifications: Notifications;
  outlet: Outlet;
  "raw-block": RawBlock;
  "remote.data-list": DataList;
  section: Section;
  "segmented-control": SegmentedControl;
  separator: Separator;
  sidebar: Sidebar;
  stack: Stack;
  tab: Tab;
  table: Table;
  tabs: Tabs;
  text: Text;
  tooltip: Tooltip;
  topbar: Topbar;
};
export type Condition = {
  readonly field: string;
  readonly operator: Op;
  readonly value: unknown;
};
export type Confirmation = {
  readonly title: string;
  readonly description: string | null;
  readonly confirmLabel: string | null;
  readonly cancelLabel: string | null;
};
export type DataList = {
  dataEndpoint: string | null;
  emptyLabel: string | null;
  remote: RemoteAccess | null;
};
export type DateFormat = {
  kind: string;
  dateStyle: DateTimeStyle | null;
  timeStyle: DateTimeStyle | null;
  month: string | null;
  year: string | null;
};
export type DateInput = {
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  max: string | null;
  min: string | null;
  name: string;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  tabIndex: number | null;
  tooltip: string | null;
  value: unknown;
};
export type DateRangeFilter = {
  label: string | null;
};
export type DateTimeInput = {
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  convertTimezone: boolean;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  max: string | null;
  min: string | null;
  name: string;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  step: number | null;
  tabIndex: number | null;
  timezone: string | null;
  tooltip: string | null;
  value: unknown;
};
export type DateTimeStyle = "full" | "long" | "medium" | "short";
export type Download = {
  readonly url: string;
};
export type Dropdown = {
  placement: Placement;
  trigger: Node[];
};
export type EditorBlockquote = object;
export type EditorBold = object;
export type EditorBulletList = object;
export type EditorCodeBlock = object;
export type EditorDetails = object;
export type EditorEmoji = {
  emojis: string[];
};
export type EditorExtension = {
  type: string;
  props?: Record<string, unknown>;
};
export type EditorExtensionPropsMap = {
  blockquote: EditorBlockquote;
  bold: EditorBold;
  "bullet-list": EditorBulletList;
  "code-block": EditorCodeBlock;
  details: EditorDetails;
  emoji: EditorEmoji;
  heading: EditorHeading;
  highlight: EditorHighlight;
  "horizontal-rule": EditorHorizontalRule;
  italic: EditorItalic;
  link: EditorLink;
  "ordered-list": EditorOrderedList;
  strike: EditorStrike;
  table: EditorTable;
  "text-align": EditorTextAlign;
  underline: EditorUnderline;
};
export type EditorHeading = {
  levels: number[];
};
export type EditorHighlight = object;
export type EditorHorizontalRule = object;
export type EditorItalic = object;
export type EditorLink = {
  protocols: string[];
  openOnClick: boolean;
};
export type EditorOrderedList = object;
export type EditorStrike = object;
export type EditorTable = {
  rows: number;
  cols: number;
  withHeaderRow: boolean;
};
export type EditorTextAlign = {
  alignments: string[];
};
export type EditorUnderline = object;
export type Effect = {
  type: string;
  props: Record<string, unknown>;
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
  toast: Toast;
  "toggle-sidebar": ToggleSidebar;
};
export type FieldConditions = {
  readonly visible: Condition[];
  readonly required: Condition[];
  readonly readOnly: Condition[];
  readonly disabled: Condition[];
};
export type FileUpload = {
  accept: string | null;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  files:
    | {
        key: string;
        name: string;
        url: string | null;
        size: number | null;
        token: string;
      }[]
    | null;
  helperText: string | null;
  image: boolean;
  label: string | null;
  maxFiles: number | null;
  maxSize: number | null;
  multiple: boolean;
  name: string;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  signed: boolean;
  tooltip: string | null;
  value: unknown;
};
export type FilterClause = {
  readonly field: string;
  readonly operator: Op;
  readonly value: string;
};
export type FilterControl =
  | "filter.select"
  | "filter.ternary"
  | "filter.date-range"
  | "filter.toggle";
export type FilterIndicator = {
  readonly filter: string;
  readonly label: string;
  readonly value: string;
};
export type FilterPropsMap = {
  "filter.date-range": DateRangeFilter;
  "filter.select": SelectFilter;
  "filter.ternary": TernaryFilter;
  "filter.toggle": ToggleFilter;
};
export type FilterType = "text" | "number" | "date" | "boolean";
export type FloatingPanel = {
  label: string | null;
  offset: number;
  placement: FloatingPlacement;
  trigger: Node[];
};
export type FloatingPlacement = "bottom-end" | "bottom-start" | "top-end" | "top-start";
export type Form = {
  action: string | null;
  errorBag: string | null;
  method: HttpMethod | null;
  precognitive: boolean;
  ref: string | null;
  resetOnError: string[] | boolean | null;
  resetOnSuccess: string[] | boolean | null;
  state: Record<string, unknown>;
  status: string | null;
  submitButton: boolean;
  submitLabel: string | null;
  validationSummaryLabel: string;
  validationTimeout: number | null;
};
export type FormFieldNodeType =
  | "field.builder"
  | "field.checkbox"
  | "field.choice"
  | "field.date-input"
  | "field.date-time-input"
  | "field.file-upload"
  | "field.hidden-input"
  | "field.number-input"
  | "field.otp"
  | "field.password-input"
  | "field.repeater"
  | "field.rich-editor"
  | "field.select"
  | "field.text-input"
  | "field.textarea"
  | "field.time-input"
  | "field.toggle";
export type FormNodeType =
  | "field.builder"
  | "field.checkbox"
  | "field.choice"
  | "field.date-input"
  | "field.date-time-input"
  | "field.file-upload"
  | "field.hidden-input"
  | "field.number-input"
  | "field.otp"
  | "field.password-input"
  | "field.repeater"
  | "field.rich-editor"
  | "field.select"
  | "field.text-input"
  | "field.textarea"
  | "field.time-input"
  | "field.toggle"
  | "form";
export type Fragment = {
  endpoint: string | null;
  lazy: boolean;
  ref: string | null;
  size: Size;
};
export type FragmentResponse = {
  readonly schema: Node[];
};
export type Gap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type Grid = {
  columns: number | null;
};
export type Heading = {
  level: number;
  text: string;
  tooltip: string | null;
};
export type Height = "full" | "screen";
export type HiddenInput = {
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  name: string;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  tooltip: string | null;
  value: unknown;
};
export type HttpMethod = import("@inertiajs/core").Method;
export type I18nConfig = {
  readonly enabled: boolean;
  readonly saveMissing: boolean;
  readonly locales: string[];
  readonly preloadLocales: string[];
  readonly timezone: string | null;
};
export type Icon = {
  class: string | null;
  color: Color | null;
  name: string;
  size: Size;
};
export type IconColumn = {
  align: ColumnAlign;
  colors: Record<string | number, string> | null;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  icon: string | null;
  icons: Record<string | number, string> | null;
  label: string | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type ImageColumn = {
  align: ColumnAlign;
  circular: boolean;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  size: number | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type LabelAction = {
  readonly href: string;
  readonly label: string;
  readonly tabIndex: number | null;
};
export type Link = {
  action: Node<"action"> | null;
  effects: Effect[];
  href: string | null;
  icon: string | null;
  label: string | null;
  method: HttpMethod | null;
  prefix: Affix | null;
  suffix: Affix | null;
  tabIndex: number | null;
};
export type Listen = {
  readonly channel: string;
  readonly visibility: ChannelVisibility;
  events: string[];
  effects: Effect[];
};
export type LocaleChange = {
  readonly locale: string;
};
export type Menu = Record<string, never>;
export type MenuItem = {
  action: Node<"action"> | null;
  effects: Effect[];
  href: string | null;
  icon: string | null;
  label: string | null;
  method: HttpMethod | null;
  prefix: Affix | null;
  suffix: Affix | null;
};
export type Modal = {
  closeLabel: string;
  description: string | null;
  open: boolean;
  ref: string | null;
  title: string | null;
};
export type MoneyColumn = {
  align: ColumnAlign;
  currency: string | null;
  currencyField: string | null;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  maximumFractionDigits: number | null;
  minimumFractionDigits: number | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type NodeType =
  | "action"
  | "action.bulk"
  | "action.group"
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
  | "collapsible"
  | "dropdown"
  | "field.builder"
  | "field.checkbox"
  | "field.choice"
  | "field.date-input"
  | "field.date-time-input"
  | "field.file-upload"
  | "field.hidden-input"
  | "field.number-input"
  | "field.otp"
  | "field.password-input"
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
  | "link"
  | "menu"
  | "menu-item"
  | "modal"
  | "notifications"
  | "outlet"
  | "raw-block"
  | "remote.data-list"
  | "section"
  | "segmented-control"
  | "separator"
  | "sidebar"
  | "stack"
  | "tab"
  | "table"
  | "tabs"
  | "text"
  | "tooltip"
  | "topbar";
export type NotificationItem = {
  readonly id: string;
  readonly title: string | null;
  readonly body: string | null;
  readonly icon: string | null;
  readonly variant: Variant | null;
  readonly href: string | null;
  readonly isRead: boolean;
  readonly createdAt: string | null;
  readonly actions: Node[];
};
export type NotificationList = {
  readonly notifications: NotificationItem[];
  readonly unreadCount: number;
  readonly hasMore: boolean;
};
export type Notifications = {
  channel: string;
  endpoint: string;
  pollingInterval: number | null;
  slideOut: boolean;
};
export type NumberColumn = {
  align: ColumnAlign;
  compact: boolean;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  maximumFractionDigits: number | null;
  minimumFractionDigits: number | null;
  sortable: boolean;
  toggleable: boolean;
  unit: NumberFormatUnit | null;
  width: ColumnWidth;
};
export type NumberFormat = {
  kind: string;
  notation: string;
  minimumFractionDigits: number | null;
  maximumFractionDigits: number | null;
  currency: string | null;
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
export type NumberInput = {
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  max: number | null;
  min: number | null;
  name: string;
  placeholder: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  prefix: Affix | null;
  readOnly: boolean;
  required: boolean;
  slider: boolean;
  step: number | null;
  suffix: Affix | null;
  tabIndex: number | null;
  tooltip: string | null;
  value: unknown;
};
export type Op =
  | "contains"
  | "starts_with"
  | "ends_with"
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "not_in"
  | "before"
  | "after"
  | "empty"
  | "filled";
export type OpenModal = {
  readonly modal: string;
};
export type Option = {
  readonly label: string;
  readonly value: string;
};
export type Orientation = "horizontal" | "vertical";
export type OtpInput = {
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  length: number;
  name: string;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  tooltip: string | null;
  value: unknown;
};
export type Outlet = Record<string, never>;
export type PageContainer = "centered" | "default";
export type PageLayout = "app" | "auth" | "none";
export type PaginationType = "none" | "simple" | "table" | "infinite";
export type PasswordInput = {
  autoComplete: string | null;
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  confirmation: {
    label: string;
    name: string;
    placeholder: string;
  } | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  labelAction: LabelAction | null;
  name: string;
  passwordRules: string | null;
  placeholder: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  prefix: Affix | null;
  readOnly: boolean;
  required: boolean;
  suffix: Affix | null;
  tabIndex: number | null;
  tooltip: string | null;
  value: unknown;
};
export type Placement = "top" | "bottom" | "right";
export type RawBlock = {
  html: string;
};
export type Redirect = {
  readonly url: string;
};
export type ReloadComponent = {
  readonly component: string;
};
export type ReloadPage = Record<string, never>;
export type RemoteAccess = {
  readonly source: string;
  readonly audience: string;
  readonly scopes: string[];
  readonly nodeId: string;
  readonly nodeType: string;
  readonly tokenEndpoint: string;
  readonly ref: string;
};
export type Repeater = {
  addLabel: string | null;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  defaultItems: number;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  itemLabel: string | null;
  label: string | null;
  layout: RowLayout;
  maxItems: number | null;
  minItems: number | null;
  name: string;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  reorderable: boolean;
  required: boolean;
  resizableColumns: boolean;
  resizeIndicator: boolean;
  rowActions: RowAction[] | null;
  tooltip: string | null;
  value: unknown;
};
export type ResetForm = {
  readonly form: string | null;
};
export type ResolveResponse = {
  readonly fields: Record<string, Node>;
  readonly values: Record<string, unknown>;
  readonly prefill: Record<string, unknown>;
};
export type RichEditor = {
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  name: string;
  placeholder: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  tooltip: string | null;
  value: unknown;
};
export type RowAction = {
  type: RowActionType;
  key: string;
  destructive: boolean;
  icon: string | null;
  label: string | null;
};
export type RowActionType = "duplicate" | "remove";
export type RowLayout = "stack" | "table";
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
export type Select = {
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  emptyLabel: string;
  helperText: string | null;
  label: string | null;
  multiple: boolean;
  name: string;
  options: Option[];
  placeholder: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  searchPlaceholder: string;
  searchable: boolean;
  tabIndex: number | null;
  tooltip: string | null;
  value: unknown;
};
export type SelectFilter = {
  label: string | null;
  multiple: boolean;
  options: Option[];
  placeholder: string | null;
  searchable: boolean;
};
export type Separator = {
  orientation: Orientation;
};
export type Side = "start" | "end";
export type Sidebar = {
  collapsible: boolean;
  rememberState: boolean;
};
export type SignedUpload = {
  readonly key: string;
  readonly url: string;
  readonly headers: Record<string, unknown>;
  readonly method: HttpMethod;
};
export type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
export type SortDirection = "asc" | "desc";
export type Stack = {
  align: Align | null;
  direction: StackDirection | null;
  float: Side | null;
  gap: Gap | null;
  height: Height | null;
  justify: Justify | null;
  width: Width | null;
};
export type StackColumn = {
  align: ColumnAlign;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type StackDirection = "row" | "column";
export type Tab = {
  confirm: {
    required: boolean;
    redirectUrl: string;
    timeout: number | null;
  } | null;
  label: string;
  value: string;
};
export type Table = {
  actionsLabel: string;
  bulkActions: Node<"action">[];
  columns: Node[];
  emptyLabel: string;
  endpoint: string | null;
  filters: Node[];
  layout: string | null;
  lazy: boolean;
  ref: string | null;
  resizableColumns: boolean;
  resizeIndicator: boolean;
  striped: boolean;
};
export type TablePagination = {
  readonly mode: PaginationType;
  readonly currentPage: number | null;
  readonly lastPage: number | null;
  readonly perPage: number | null;
  readonly total: number | null;
  readonly from: number | null;
  readonly to: number | null;
  readonly hasMore: boolean;
  readonly nextPage: number | null;
};
export type TableQuery = {
  readonly filters: FilterClause[];
  readonly sorts: TableSort[];
  readonly page: number;
  readonly perPage: number;
  readonly tableFilters: Record<string, Record<string, unknown>>;
  readonly tableFilterIndicators: FilterIndicator[];
};
export type TableResult = {
  readonly query: TableQuery;
  readonly data: Record<string, unknown>[];
  readonly pagination: TablePagination | null;
};
export type TableSort = {
  readonly key: string;
  readonly direction: SortDirection;
};
export type Tabs = {
  activeValue: string;
  alignment: TabsAlignment;
  defaultValue: string | null;
  orientation: Orientation;
  queryKey: string;
};
export type TabsAlignment = "start" | "center" | "end" | "stretch";
export type TernaryFilter = {
  falseLabel: string;
  label: string | null;
  placeholder: string;
  trueLabel: string;
};
export type Text = {
  align: Align | null;
  color: Color | null;
  copyable: boolean;
  size: Size;
  text: string;
};
export type TextColumn = {
  align: ColumnAlign;
  badge: {
    colorKey: string;
  } | null;
  copyable: boolean;
  date: {
    dateStyle: DateTimeStyle | null;
    timeStyle: DateTimeStyle | null;
  } | null;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  link: {
    href: string | null;
    external: boolean;
  } | null;
  multiple: string | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type TextInput = {
  autoComplete: string | null;
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  name: string;
  placeholder: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  prefix: Affix | null;
  readOnly: boolean;
  required: boolean;
  suffix: Affix | null;
  tabIndex: number | null;
  tooltip: string | null;
  type: string | null;
  value: unknown;
};
export type TextPart = {
  text: string;
};
export type Textarea = {
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  name: string;
  placeholder: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  rows: number | null;
  tabIndex: number | null;
  tooltip: string | null;
  value: unknown;
};
export type TimeInput = {
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  max: string | null;
  min: string | null;
  name: string;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  step: number | null;
  tabIndex: number | null;
  tooltip: string | null;
  value: unknown;
};
export type Toast = {
  variant: Variant;
  message: Translatable | string;
  duration: number | null;
  persistent: boolean;
  dismissible: boolean;
  action: Node | null;
};
export type Toggle = {
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  name: string;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  tabIndex: number | null;
  tooltip: string | null;
  value: unknown;
};
export type ToggleFilter = {
  label: string | null;
};
export type ToggleSidebar = {
  readonly target: string | null;
};
export type ToolCallPart = {
  args: Record<string, unknown>;
  name: string;
};
export type Tooltip = {
  content: string | null;
  trigger: Node[];
};
export type Topbar = {
  sticky: boolean;
};
export type Translatable = {
  payload: Record<string, string>;
  replacements: Record<string, string | number | boolean>;
  key: string;
};
export type UnreadCount = {
  readonly unreadCount: number;
};
export type Variant = "success" | "info" | "warning" | "error";
export type Width = "full" | "auto" | "sm" | "md" | "lg" | "fill";
export type WireNode = Node;
