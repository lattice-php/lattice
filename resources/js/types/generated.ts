export type Action = {
  confirmation: {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  } | null;
  effects: Effect[];
  endpoint: string | null;
  form: Form | null;
  icon: string | null;
  label: string | null;
  method: HttpMethod | null;
  ref: string | null;
  variant: ButtonVariant | null;
};
export type ActionGroup = {
  label: string | null;
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
export type BulkAction = {
  confirmation: {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  } | null;
  effects: Effect[];
  endpoint: string | null;
  form: Form | null;
  icon: string | null;
  label: string | null;
  method: HttpMethod | null;
  ref: string | null;
  variant: ButtonVariant | null;
};
export type Button = {
  href: string | null;
  label: string;
  variant: ButtonVariant | null;
};
export type ButtonVariant = "default" | "destructive" | "ghost" | "link" | "outline" | "secondary";
export type Card = {
  description: string | null;
  title: string | null;
};
export type Checkbox = {
  conditions: Record<
    string,
    {
      field: string;
      operator: string;
      value: any;
    }[]
  > | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  hidden: boolean | null;
  label: string | null;
  name: string;
  readonly: boolean | null;
  required: boolean | null;
  tabIndex: number | null;
  value: any;
};
export type Choice = {
  conditions: Record<
    string,
    {
      field: string;
      operator: string;
      value: any;
    }[]
  > | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  hidden: boolean | null;
  label: string | null;
  name: string;
  options: {
    label: string;
    value: string;
  }[];
  readonly: boolean | null;
  required: boolean | null;
  value: any;
};
export type CloseModalEffect = {
  readonly modal?: string | null;
};
export type ColumnData = {
  readonly key: string;
  readonly label: string;
  readonly type: ColumnType | string;
  readonly sortable: boolean | null;
  readonly filter: ColumnFilter | null;
  readonly date: {
    format: string | null;
  } | null;
  readonly copyable: boolean | null;
  readonly link: {
    href: string | null;
    external: boolean;
  } | null;
  readonly columns: ColumnData[] | null;
  readonly props: Record<string, any> | null;
};
export type ColumnFilter = {
  readonly enabled: boolean;
  readonly type: FilterType;
  readonly operators: Op[];
  readonly defaultOperator: Op;
};
export type ColumnType = "text" | "stack";
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
  conditions: Record<
    string,
    {
      field: string;
      operator: string;
      value: any;
    }[]
  > | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  hidden: boolean | null;
  label: string | null;
  max: string | null;
  min: string | null;
  name: string;
  readonly: boolean | null;
  required: boolean | null;
  tabIndex: number | null;
  value: any;
};
export type DownloadEffect = {
  readonly url: string;
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
  state: Record<string, any>;
  status: string | null;
  submitButton: boolean | null;
  submitLabel: string | null;
  validationTimeout: number | null;
};
export type FormFieldNode =
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
      type: "form.submit-button";
      key?: string;
      props: SubmitButton;
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
export type Gap = "xs" | "sm" | "md" | "lg" | "xl";
export type Grid = {
  columns: number | null;
};
export type Heading = {
  level: number;
  text: string;
};
export type HiddenInput = {
  conditions: Record<
    string,
    {
      field: string;
      operator: string;
      value: any;
    }[]
  > | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  hidden: boolean | null;
  label: string | null;
  name: string;
  readonly: boolean | null;
  required: boolean | null;
  value: any;
};
export type HttpMethod = import("@inertiajs/core").Method;
export type LayoutNode =
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
    };
export type Link = {
  href: string | null;
  label: string;
  method: HttpMethod | null;
  tabIndex: number | null;
};
export type Menu = object;
export type MenuItem = {
  href: string | null;
  icon: string | null;
  label: string;
  method: HttpMethod | null;
};
export type Modal = {
  closeLabel: string | null;
  description: string | null;
  open: boolean | null;
  ref: string | null;
  title: string | null;
};
export type Node = FormNode | CoreNode | ActionNode | FragmentNode | TableNode | LayoutNode;
export type NodeType = Node["type"];
export type NumberInput = {
  autoFocus: boolean | null;
  conditions: Record<
    string,
    {
      field: string;
      operator: string;
      value: any;
    }[]
  > | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  hidden: boolean | null;
  label: string | null;
  max: number | null;
  min: number | null;
  name: string;
  placeholder: string | null;
  readonly: boolean | null;
  required: boolean | null;
  slider: boolean | null;
  step: number | null;
  tabIndex: number | null;
  value: any;
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
export type Orientation = "horizontal" | "vertical";
export type Outlet = object;
export type PageContainer = "centered" | "default";
export type PageLayout = "app" | "auth" | "none";
export type PaginationType = "none" | "simple" | "table" | "infinite";
export type PasswordInput = {
  autoComplete: string | null;
  autoFocus: boolean | null;
  conditions: Record<
    string,
    {
      field: string;
      operator: string;
      value: any;
    }[]
  > | null;
  confirmation: {
    label: string;
    name: string;
    placeholder: string;
  } | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
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
  readonly: boolean | null;
  required: boolean | null;
  tabIndex: number | null;
  value: any;
};
export type RedirectEffect = {
  readonly url: string;
};
export type ReloadComponentEffect = {
  readonly component: string;
};
export type ReloadPageEffect = object;
export type ResetFormEffect = {
  readonly form?: string | null;
};
export type RichEditor = {
  conditions: Record<
    string,
    {
      field: string;
      operator: string;
      value: any;
    }[]
  > | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  hidden: boolean | null;
  label: string | null;
  name: string;
  placeholder: string | null;
  readonly: boolean | null;
  required: boolean | null;
  value: any;
};
export type SegmentedControl = {
  emits: string | null;
  label: string | null;
  name: string;
  options: {
    label: string;
    value: string;
  }[];
  value: string | null;
};
export type Select = {
  conditions: Record<
    string,
    {
      field: string;
      operator: string;
      value: any;
    }[]
  > | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  hidden: boolean | null;
  label: string | null;
  multiple: boolean | null;
  name: string;
  options: {
    label: string;
    value: string;
  }[];
  placeholder: string | null;
  readonly: boolean | null;
  required: boolean | null;
  searchable: boolean | null;
  value: any;
};
export type SortDirection = "asc" | "desc";
export type Stack = {
  align: Align | null;
  direction: string | null;
  gap: Gap | null;
  width: Width | null;
};
export type SubmitButton = {
  label: string | null;
  variant: ButtonVariant | null;
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
  bulkActions: Action[];
  columns: ColumnData[];
  endpoint: string | null;
  layout: string | null;
  lazy: boolean | null;
  ref: string | null;
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
  text: string;
};
export type TextInput = {
  autoComplete: string | null;
  autoFocus: boolean | null;
  conditions: Record<
    string,
    {
      field: string;
      operator: string;
      value: any;
    }[]
  > | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  hidden: boolean | null;
  label: string | null;
  name: string;
  placeholder: string | null;
  readonly: boolean | null;
  required: boolean | null;
  tabIndex: number | null;
  type: string | null;
  value: any;
};
export type Textarea = {
  autoFocus: boolean | null;
  conditions: Record<
    string,
    {
      field: string;
      operator: string;
      value: any;
    }[]
  > | null;
  dependsOnAny: boolean | null;
  dependsOnKeys: string[] | null;
  disabled: boolean | null;
  hidden: boolean | null;
  label: string | null;
  name: string;
  placeholder: string | null;
  readonly: boolean | null;
  required: boolean | null;
  rows: number | null;
  tabIndex: number | null;
  value: any;
};
export type ToastEffect = {
  readonly variant: ToastVariant;
  readonly message: string;
};
export type ToastVariant = "success" | "info" | "warning" | "error";
export type Width = "full" | "sm" | "md" | "lg";
