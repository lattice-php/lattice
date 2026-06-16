export type Action = {
  confirmation: Confirmation | null;
  effects: Effect[];
  endpoint: string | null;
  form: Node | null;
  icon: string | null;
  label: string | null;
  lazyForm: boolean | null;
  method: HttpMethod | null;
  ref: string | null;
  variant: ButtonVariant | null;
};
export type ActionGroup = {
  label: string;
  orientation: Orientation | null;
  ref: string | null;
};
export type ActionNode =
  | {
      type: "action";
      key?: string;
      id?: string;
      props: Action;
    }
  | {
      type: "action.group";
      key?: string;
      id?: string;
      props: ActionGroup;
      schema?: Node[];
    }
  | {
      type: "bulkAction";
      key?: string;
      id?: string;
      props: BulkAction;
    };
export type ActionResult = {
  readonly ok: boolean;
  readonly data: Record<string, unknown>;
  readonly effects: Effect[];
};
export type Align = "center" | "left" | "start" | "stretch";
export type Badge = {
  label: string;
};
export type BadgeColumn = {
  colors: Record<string | number, string> | null;
};
export type BooleanColumn = Record<string, never>;
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
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  defaultItems: number;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  hidden: boolean;
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
  effects: Effect[];
  endpoint: string | null;
  form: Node | null;
  icon: string | null;
  label: string | null;
  lazyForm: boolean | null;
  method: HttpMethod | null;
  ref: string | null;
  variant: ButtonVariant | null;
};
export type Button = {
  buttonType: ButtonType;
  href: string | null;
  label: string;
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
  title: string | null;
  dismissible: boolean;
  action: Node | null;
  variant: Variant;
  message: string;
};
export type CalloutEffect = {
  readonly callout: Callout;
};
export type Callouts = Record<string, never>;
export type Card = {
  description: string | null;
  title: string | null;
};
export type Chart = {
  categoryKey: string | null;
  data: Record<string, unknown>[];
  description: string | null;
  grid: boolean;
  height: number;
  legend: boolean;
  series: ChartSeries[];
  title: string | null;
  tooltip: boolean;
  xAxis: boolean;
  yAxis: boolean;
};
export type ChartSeries = {
  readonly type: ChartSeriesType;
  readonly dataKey: string;
  readonly name: string | null;
  readonly color: string | null;
  readonly stackId: string | null;
  readonly nameKey: string | null;
};
export type ChartSeriesType = "area" | "bar" | "line" | "pie";
export type ChatBox = {
  conversationId: string | null;
  fill: boolean;
  historyEndpoint: string | null;
  placeholder: string | null;
  streamEndpoint: string | null;
  title: string | null;
};
export type ChatMessage = {
  readonly id: string;
  readonly role: ChatRole;
  readonly parts: Node[];
};
export type ChatNode =
  | {
      type: "chat.part.text";
      key?: string;
      props: TextPart;
    }
  | {
      type: "chat.part.tool-call";
      key?: string;
      props: ToolCallPart;
    };
export type ChatRole = "user" | "assistant" | "system";
export type Checkbox = {
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  hidden: boolean;
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
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  hidden: boolean;
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
export type CloseModalEffect = {
  readonly modal: string | null;
};
export type Color = "default" | "muted" | "primary" | "success" | "info" | "warning" | "danger";
export type ColumnAlign = "start" | "center" | "end";
export type ColumnData = {
  readonly key: string;
  readonly label: string;
  readonly type: ColumnType | string;
  readonly width: ColumnWidth;
  readonly align: ColumnAlign;
  readonly sortable: boolean | null;
  readonly filter: ColumnFilter | null;
  readonly columns: ColumnData[] | null;
  readonly props: Record<string, unknown> | null;
};
export type ColumnFilter = {
  readonly enabled: boolean;
  readonly type: FilterType;
  readonly operators: Op[];
  readonly defaultOperator: Op;
  readonly control: FilterControl | null;
  readonly options: Option[];
  readonly multiple: boolean;
  readonly searchable: boolean;
  readonly clauseOptions?: ColumnFilterOption[];
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
export type CoreNode =
  | {
      type: "badge";
      key?: string;
      props: Badge;
    }
  | {
      type: "button";
      key?: string;
      props: Button;
    }
  | {
      type: "card";
      key?: string;
      props: Card;
      schema?: Node[];
    }
  | {
      type: "chart";
      key?: string;
      props: Chart;
    }
  | {
      type: "chat.box";
      key?: string;
      props: ChatBox;
    }
  | {
      type: "floating-panel";
      key?: string;
      props: FloatingPanel;
      schema?: Node[];
    }
  | {
      type: "grid";
      key?: string;
      props: Grid;
      schema?: Node[];
    }
  | {
      type: "heading";
      key?: string;
      props: Heading;
    }
  | {
      type: "icon";
      key?: string;
      props: Icon;
    }
  | {
      type: "link";
      key?: string;
      props: Link;
    }
  | {
      type: "modal";
      key?: string;
      id?: string;
      props: Modal;
      schema?: Node[];
    }
  | {
      type: "raw-block";
      key?: string;
      props: RawBlock;
    }
  | {
      type: "section";
      key?: string;
      props: Section;
      schema?: Node[];
    }
  | {
      type: "segmented-control";
      key?: string;
      props: SegmentedControl;
    }
  | {
      type: "stack";
      key?: string;
      props: Stack;
      schema?: Node[];
    }
  | {
      type: "tab";
      key?: string;
      props: Tab;
      schema?: Node[];
    }
  | {
      type: "tabs";
      key?: string;
      props: Tabs;
      schema?: Node[];
    }
  | {
      type: "text";
      key?: string;
      props: Text;
    };
export type DataList = {
  dataEndpoint: string | null;
  emptyLabel: string | null;
  remote: RemoteAccess | null;
};
export type DateInput = {
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  hidden: boolean;
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
export type DownloadEffect = {
  readonly url: string;
};
export type Dropdown = {
  placement: Placement;
  trigger: Node[];
};
export type Effect =
  | ({
      type: "callout";
    } & CalloutEffect)
  | ({
      type: "closeModal";
    } & CloseModalEffect)
  | ({
      type: "download";
    } & DownloadEffect)
  | ({
      type: "localeChange";
    } & LocaleChangeEffect)
  | ({
      type: "openModal";
    } & OpenModalEffect)
  | ({
      type: "redirect";
    } & RedirectEffect)
  | ({
      type: "reloadComponent";
    } & ReloadComponentEffect)
  | ({
      type: "reloadPage";
    } & ReloadPageEffect)
  | ({
      type: "resetForm";
    } & ResetFormEffect)
  | ({
      type: "toast";
    } & ToastEffect);
export type EffectType =
  | "toast"
  | "callout"
  | "reloadComponent"
  | "reloadPage"
  | "redirect"
  | "download"
  | "openModal"
  | "closeModal"
  | "resetForm"
  | "localeChange";
export type FieldType =
  | "field.builder"
  | "field.checkbox"
  | "field.choice"
  | "field.date-input"
  | "field.file-upload"
  | "field.hidden-input"
  | "field.number-input"
  | "field.password-input"
  | "field.repeater"
  | "field.rich-editor"
  | "field.select"
  | "field.textarea"
  | "field.text-input";
export type FileUpload = {
  accept: string | null;
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
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
  hidden: boolean;
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
  readonly operator: string;
  readonly value: string;
};
export type FilterControl = "select" | "ternary" | "date-range" | "toggle";
export type FilterData = {
  readonly key: string;
  readonly label: string;
  readonly type: FilterControl;
  readonly props: Record<string, unknown>;
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
export type FormFieldNode =
  | {
      type: "field.builder";
      key?: string;
      props: Builder;
    }
  | {
      type: "field.checkbox";
      key?: string;
      props: Checkbox;
    }
  | {
      type: "field.choice";
      key?: string;
      props: Choice;
    }
  | {
      type: "field.date-input";
      key?: string;
      props: DateInput;
    }
  | {
      type: "field.file-upload";
      key?: string;
      props: FileUpload;
    }
  | {
      type: "field.hidden-input";
      key?: string;
      props: HiddenInput;
    }
  | {
      type: "field.number-input";
      key?: string;
      props: NumberInput;
    }
  | {
      type: "field.password-input";
      key?: string;
      props: PasswordInput;
    }
  | {
      type: "field.repeater";
      key?: string;
      props: Repeater;
    }
  | {
      type: "field.rich-editor";
      key?: string;
      props: RichEditor;
    }
  | {
      type: "field.select";
      key?: string;
      props: Select;
    }
  | {
      type: "field.text-input";
      key?: string;
      props: TextInput;
    }
  | {
      type: "field.textarea";
      key?: string;
      props: Textarea;
    };
export type FormNode =
  | FormFieldNode
  | {
      type: "form";
      key?: string;
      id?: string;
      props: Form;
      schema?: Node[];
    };
export type FormNodeType = FormNode["type"];
export type Fragment = {
  endpoint: string | null;
  lazy: boolean | null;
  ref: string | null;
  size: Size;
};
export type FragmentNode = {
  type: "fragment";
  key?: string;
  id?: string;
  props: Fragment;
  schema?: Node[];
};
export type Gap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type Grid = {
  columns: number | null;
};
export type Heading = {
  level: number;
  text: string;
};
export type Height = "full" | "screen";
export type HiddenInput = {
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  hidden: boolean;
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
};
export type Icon = {
  class: string | null;
  color: Color | null;
  name: string;
  size: Size;
};
export type IconColumn = {
  colors: Record<string | number, string> | null;
  icon: string | null;
  icons: Record<string | number, string> | null;
};
export type ImageColumn = {
  circular: boolean;
  size: number | null;
};
export type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type LayoutNode =
  | {
      type: "breadcrumbs";
      key?: string;
      props: Breadcrumbs;
    }
  | {
      type: "callouts";
      key?: string;
      props: Callouts;
    }
  | {
      type: "dropdown";
      key?: string;
      props: Dropdown;
      schema?: Node[];
    }
  | {
      type: "menu";
      key?: string;
      props: Menu;
      schema?: Node[];
    }
  | {
      type: "menu-item";
      key?: string;
      props: MenuItem;
      schema?: Node[];
    }
  | {
      type: "outlet";
      key?: string;
      props: Outlet;
    }
  | {
      type: "sidebar";
      key?: string;
      props: Sidebar;
      schema?: Node[];
    };
export type Link = {
  href: string | null;
  label: string;
  method: HttpMethod | null;
  tabIndex: number | null;
};
export type LocaleChangeEffect = {
  readonly locale: string;
};
export type Menu = Record<string, never>;
export type MenuItem = {
  href: string | null;
  icon: string | null;
  label: string;
  method: HttpMethod | null;
};
export type Modal = {
  closeLabel: string;
  description: string | null;
  open: boolean | null;
  ref: string | null;
  title: string | null;
};
export type MoneyColumn = {
  currency: string | null;
  currencyField: string | null;
  maximumFractionDigits: number | null;
  minimumFractionDigits: number | null;
};
export type Node =
  | FormNode
  | CoreNode
  | ActionNode
  | FragmentNode
  | RemoteNode
  | TableNode
  | LayoutNode
  | ChatNode;
export type NodeType = Node["type"];
export type NumberColumn = {
  maximumFractionDigits: number | null;
  minimumFractionDigits: number | null;
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
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  hidden: boolean;
  label: string | null;
  max: number | null;
  min: number | null;
  name: string;
  placeholder: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  slider: boolean;
  step: number | null;
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
export type OpenModalEffect = {
  readonly modal: string;
};
export type Option = {
  readonly label: string;
  readonly value: string;
};
export type Orientation = "horizontal" | "vertical";
export type Outlet = Record<string, never>;
export type PageContainer = "centered" | "default";
export type PageLayout = "app" | "auth" | "none";
export type PaginationType = "none" | "simple" | "table" | "infinite";
export type PasswordInput = {
  autoComplete: string | null;
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
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
  hidden: boolean;
  label: string | null;
  labelAction: {
    href: string;
    label: string;
    tabIndex?: number;
  } | null;
  name: string;
  passwordRules: string | null;
  placeholder: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  tabIndex: number | null;
  tooltip: string | null;
  value: unknown;
};
export type Placement = "top" | "bottom" | "right";
export type RawBlock = {
  html: string;
};
export type RedirectEffect = {
  readonly url: string;
};
export type ReloadComponentEffect = {
  readonly component: string;
};
export type ReloadPageEffect = object;
export type RemoteAccess = {
  readonly source: string;
  readonly audience: string;
  readonly scopes: string[];
  readonly nodeId: string;
  readonly nodeType: string;
  readonly tokenEndpoint: string;
  readonly ref: string;
};
export type RemoteChatBox = {
  conversationId: string | null;
  fill: boolean;
  historyEndpoint: string | null;
  placeholder: string | null;
  remote: RemoteAccess | null;
  streamEndpoint: string | null;
  title: string | null;
};
export type RemoteNode =
  | {
      type: "remote.chat-box";
      key?: string;
      props: RemoteChatBox;
    }
  | {
      type: "remote.data-list";
      key?: string;
      props: DataList;
      schema?: Node[];
    };
export type Repeater = {
  addLabel: string | null;
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  defaultItems: number;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  hidden: boolean;
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
export type ResetFormEffect = {
  readonly form: string | null;
};
export type RichEditor = {
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  hidden: boolean;
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
  label: string | null;
  icon: string | null;
  destructive: boolean;
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
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  emptyLabel: string;
  helperText: string | null;
  hidden: boolean;
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
export type Sidebar = {
  collapsible: boolean;
  rememberState: boolean;
};
export type Size = "xs" | "sm" | "md" | "lg" | "xl";
export type SortDirection = "asc" | "desc";
export type Stack = {
  align: Align | null;
  direction: string | null;
  gap: Gap | null;
  height: Height | null;
  justify: Justify | null;
  width: Width | null;
};
export type Tab = {
  confirm: {
    required: boolean;
    redirectUrl: string;
    timeout?: number;
  } | null;
  label: string;
  value: string;
};
export type Table = {
  actionsLabel: string;
  bulkActions: Node[];
  columns: ColumnData[];
  emptyLabel: string;
  endpoint: string | null;
  filters: FilterData[];
  layout: string | null;
  lazy: boolean | null;
  ref: string | null;
  resizableColumns: boolean | null;
  resizeIndicator: boolean;
  striped: boolean | null;
};
export type TableNode = {
  type: "table";
  key?: string;
  id?: string;
  props: Table;
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
  readonly tableFilters: Record<string, unknown>;
};
export type TableSort = {
  readonly key: string;
  readonly direction: SortDirection;
};
export type Tabs = {
  activeValue: string;
  defaultValue: string | null;
  orientation: Orientation;
  queryKey: string;
};
export type Text = {
  align: Align | null;
  color: Color;
  size: Size;
  text: string;
};
export type TextColumn = {
  copyable: boolean;
  date: {
    format: string | null;
  } | null;
  link: {
    href: string | null;
    external: boolean;
  } | null;
};
export type TextInput = {
  autoComplete: string | null;
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  hidden: boolean;
  label: string | null;
  name: string;
  placeholder: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
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
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  hidden: boolean;
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
export type ToastEffect = {
  readonly toast: ToastMessage;
};
export type ToastMessage = {
  duration: number | null;
  persistent: boolean;
  dismissible: boolean;
  action: Node | null;
  variant: Variant;
  message: string;
};
export type ToolCallPart = {
  args: Record<string, unknown>;
  name: string;
};
export type Variant = "success" | "info" | "warning" | "error";
export type Width = "full" | "sm" | "md" | "lg" | "fill";
