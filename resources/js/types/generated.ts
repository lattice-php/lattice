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
export type Align = "center" | "left" | "start" | "stretch";
export type Badge = {
  label: string;
};
export type BadgeColumnProps = {
  readonly colors: Record<string | number, string> | null;
};
export type Breadcrumbs = Record<string, never>;
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
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  helperText: string | null;
  hidden: boolean | null;
  label: string | null;
  layout: RowLayout;
  maxItems: number | null;
  minItems: number | null;
  name: string;
  prefill: boolean | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean | null;
  reorderable: boolean;
  required: boolean | null;
  resizableColumns: boolean | null;
  resizeIndicator: boolean;
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
export type Card = {
  description: string | null;
  title: string | null;
};
export type Checkbox = {
  autoFocus: boolean | null;
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  helperText: string | null;
  hidden: boolean | null;
  label: string | null;
  name: string;
  prefill: boolean | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean | null;
  required: boolean | null;
  tabIndex: number | null;
  value: unknown;
};
export type Choice = {
  autoFocus: boolean | null;
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  helperText: string | null;
  hidden: boolean | null;
  label: string | null;
  name: string;
  options: Option[];
  prefill: boolean | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean | null;
  required: boolean | null;
  tabIndex: number | null;
  value: unknown;
};
export type CloseModalEffect = {
  readonly modal: string | null;
};
export type Color = "default" | "muted" | "primary" | "success" | "info" | "warning" | "danger";
export type ColumnData = {
  readonly key: string;
  readonly label: string;
  readonly type: ColumnType | string;
  readonly width: ColumnWidth;
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
};
export type ColumnPropsMap = {
  badge: BadgeColumnProps;
  icon: IconColumnProps;
  image: ImageColumnProps;
  text: TextColumnProps;
};
export type ColumnType = "text" | "stack" | "badge" | "icon" | "image";
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
export type DateInput = {
  autoFocus: boolean | null;
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  helperText: string | null;
  hidden: boolean | null;
  label: string | null;
  max: string | null;
  min: string | null;
  name: string;
  prefill: boolean | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean | null;
  required: boolean | null;
  tabIndex: number | null;
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
      type: "closeModal";
    } & CloseModalEffect)
  | ({
      type: "download";
    } & DownloadEffect)
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
  | "reloadComponent"
  | "reloadPage"
  | "redirect"
  | "download"
  | "openModal"
  | "closeModal"
  | "resetForm";
export type FilterClause = {
  readonly field: string;
  readonly operator: string;
  readonly value: string;
};
export type FilterType = "text" | "number" | "date" | "boolean";
export type Form = {
  action: string | null;
  errorBag: string | null;
  method: HttpMethod | null;
  precognitive: boolean | null;
  ref: string | null;
  resetOnError: string[] | boolean | null;
  resetOnSuccess: string[] | boolean | null;
  state: Record<string, unknown>;
  status: string | null;
  submitButton: boolean | null;
  submitLabel: string | null;
  validationSummaryLabel: string;
  validationTimeout: number | null;
};
export type FormFieldNode =
  | {
      type: "form.builder";
      key?: string;
      props: Builder;
    }
  | {
      type: "form.checkbox";
      key?: string;
      props: Checkbox;
    }
  | {
      type: "form.choice";
      key?: string;
      props: Choice;
    }
  | {
      type: "form.date-input";
      key?: string;
      props: DateInput;
    }
  | {
      type: "form.hidden-input";
      key?: string;
      props: HiddenInput;
    }
  | {
      type: "form.number-input";
      key?: string;
      props: NumberInput;
    }
  | {
      type: "form.password-input";
      key?: string;
      props: PasswordInput;
    }
  | {
      type: "form.repeater";
      key?: string;
      props: Repeater;
    }
  | {
      type: "form.rich-editor";
      key?: string;
      props: RichEditor;
    }
  | {
      type: "form.select";
      key?: string;
      props: Select;
    }
  | {
      type: "form.text-input";
      key?: string;
      props: TextInput;
    }
  | {
      type: "form.textarea";
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
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  helperText: string | null;
  hidden: boolean | null;
  label: string | null;
  name: string;
  prefill: boolean | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean | null;
  required: boolean | null;
  value: unknown;
};
export type HttpMethod = import("@inertiajs/core").Method;
export type Icon = {
  class: string | null;
  color: Color | null;
  name: string;
  size: Size;
};
export type IconColumnProps = {
  readonly icon: string | null;
  readonly icons: Record<string | number, string> | null;
  readonly colors: Record<string | number, string> | null;
};
export type ImageColumnProps = {
  readonly circular: boolean;
  readonly size: number | null;
};
export type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type LayoutNode =
  | {
      type: "breadcrumbs";
      key?: string;
      props: Breadcrumbs;
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
export type Node = FormNode | CoreNode | ActionNode | FragmentNode | TableNode | LayoutNode;
export type NodeType = Node["type"];
export type NumberInput = {
  autoFocus: boolean | null;
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  helperText: string | null;
  hidden: boolean | null;
  label: string | null;
  max: number | null;
  min: number | null;
  name: string;
  placeholder: string | null;
  prefill: boolean | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean | null;
  required: boolean | null;
  slider: boolean | null;
  step: number | null;
  tabIndex: number | null;
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
  autoFocus: boolean | null;
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
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  helperText: string | null;
  hidden: boolean | null;
  label: string | null;
  labelAction: {
    href: string;
    label: string;
    tabIndex?: number;
  } | null;
  name: string;
  passwordRules: string | null;
  placeholder: string | null;
  prefill: boolean | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean | null;
  required: boolean | null;
  tabIndex: number | null;
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
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  helperText: string | null;
  hidden: boolean | null;
  itemLabel: string | null;
  label: string | null;
  layout: RowLayout;
  maxItems: number | null;
  minItems: number | null;
  name: string;
  prefill: boolean | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean | null;
  reorderable: boolean;
  required: boolean | null;
  resizableColumns: boolean | null;
  resizeIndicator: boolean;
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
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  helperText: string | null;
  hidden: boolean | null;
  label: string | null;
  name: string;
  placeholder: string | null;
  prefill: boolean | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean | null;
  required: boolean | null;
  value: unknown;
};
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
  autoFocus: boolean | null;
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  emptyLabel: string;
  helperText: string | null;
  hidden: boolean | null;
  label: string | null;
  multiple: boolean | null;
  name: string;
  options: Option[];
  placeholder: string | null;
  prefill: boolean | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean | null;
  required: boolean | null;
  searchPlaceholder: string;
  searchable: boolean | null;
  tabIndex: number | null;
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
export type TextColumnProps = {
  readonly date: {
    format: string | null;
  } | null;
  readonly copyable: boolean;
  readonly link: {
    href: string | null;
    external: boolean;
  } | null;
};
export type TextInput = {
  autoComplete: string | null;
  autoFocus: boolean | null;
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  helperText: string | null;
  hidden: boolean | null;
  label: string | null;
  name: string;
  placeholder: string | null;
  prefill: boolean | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean | null;
  required: boolean | null;
  tabIndex: number | null;
  type: string | null;
  value: unknown;
};
export type Textarea = {
  autoFocus: boolean | null;
  columnWidth: ColumnWidth;
  conditions: {
    visible?: Condition[];
    required?: Condition[];
    readOnly?: Condition[];
    disabled?: Condition[];
  } | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  helperText: string | null;
  hidden: boolean | null;
  label: string | null;
  name: string;
  placeholder: string | null;
  prefill: boolean | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean | null;
  required: boolean | null;
  rows: number | null;
  tabIndex: number | null;
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
  variant: ToastVariant;
  message: string;
};
export type ToastVariant = "success" | "info" | "warning" | "error";
export type Width = "full" | "sm" | "md" | "lg" | "fill";
