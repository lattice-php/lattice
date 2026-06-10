export type Align = 'center' | 'left' | 'start' | 'stretch';
export type Checkbox = {
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnAny?: boolean | null,
dependsOnKeys?: string[] | null,
disabled?: boolean | null,
hidden?: boolean | null,
label?: string | null,
name: string,
readonly?: boolean | null,
required?: boolean | null,
tabIndex?: number | null,
value?: any,
};
export type Choice = {
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnAny?: boolean | null,
dependsOnKeys?: string[] | null,
disabled?: boolean | null,
hidden?: boolean | null,
label?: string | null,
name: string,
options?: {
label: string,
value: string,
}[],
readonly?: boolean | null,
required?: boolean | null,
value?: any,
};
export type ColumnData = {
readonly key: string,
readonly label: string,
readonly type: ColumnType,
readonly sortable: boolean | null,
readonly filter: ColumnFilter | null,
readonly date: {
format: string | null,
} | null,
readonly copyable: boolean | null,
readonly link: {
href: string | null,
external: boolean,
} | null,
readonly columns: ColumnData[] | null,
};
export type ColumnFilter = {
readonly enabled: boolean,
readonly type: FilterType,
readonly operators: FilterOperator[],
readonly defaultOperator: FilterOperator,
};
export type ColumnType = 'text' | 'stack';
export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in' | 'empty' | 'filled';
export type DateInput = {
autoFocus?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnAny?: boolean | null,
dependsOnKeys?: string[] | null,
disabled?: boolean | null,
hidden?: boolean | null,
label?: string | null,
max?: string | null,
min?: string | null,
name: string,
readonly?: boolean | null,
required?: boolean | null,
tabIndex?: number | null,
value?: any,
};
export type EffectType = 'toast' | 'reloadComponent' | 'reloadPage' | 'redirect' | 'download' | 'openModal' | 'closeModal' | 'resetForm';
export type FilterOperator = 'contains' | 'starts_with' | 'ends_with' | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'before' | 'after' | 'empty' | 'filled';
export type FilterType = 'text' | 'number' | 'date' | 'boolean';
export type Form = {
action?: string | null,
errorBag?: string | null,
method?: HttpMethod | null,
precognitive?: boolean | null,
ref?: string | null,
resetOnError?: string[] | boolean | null,
resetOnSuccess?: string[] | boolean | null,
state?: Record<string, any>,
status?: string | null,
submitButton?: boolean | null,
submitLabel?: string | null,
validationTimeout?: number | null,
};
export type FormFieldNode = 
  | { type: "form.text-input"; key?: string; props: TextInput }
  | { type: "form.textarea"; key?: string; props: Textarea }
  | { type: "form.select"; key?: string; props: Select }
  | { type: "form.choice"; key?: string; props: Choice }
  | { type: "form.checkbox"; key?: string; props: Checkbox }
  | { type: "form.date-input"; key?: string; props: DateInput }
  | { type: "form.number-input"; key?: string; props: NumberInput }
  | { type: "form.password-input"; key?: string; props: PasswordInput }
  | { type: "form.hidden-input"; key?: string; props: HiddenInput }
  | { type: "form.rich-editor"; key?: string; props: RichEditor }
  | { type: "form.submit-button"; key?: string; props: SubmitButton };
export type FormNode = 
  | FormFieldNode
  | { type: "form"; key?: string; id?: string; props: Form; schema?: FormFieldNode[] };
export type FormNodeType = FormNode["type"];
export type Gap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type HiddenInput = {
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnAny?: boolean | null,
dependsOnKeys?: string[] | null,
disabled?: boolean | null,
hidden?: boolean | null,
label?: string | null,
name: string,
readonly?: boolean | null,
required?: boolean | null,
value?: any,
};
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type NumberInput = {
autoFocus?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnAny?: boolean | null,
dependsOnKeys?: string[] | null,
disabled?: boolean | null,
hidden?: boolean | null,
label?: string | null,
max?: number | null,
min?: number | null,
name: string,
placeholder?: string | null,
readonly?: boolean | null,
required?: boolean | null,
slider?: boolean | null,
step?: number | null,
tabIndex?: number | null,
value?: any,
};
export type PageContainer = 'centered' | 'default';
export type PageLayout = 'app' | 'auth' | 'none';
export type PaginationType = 'none' | 'simple' | 'table' | 'infinite';
export type PasswordInput = {
autoComplete?: string | null,
autoFocus?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
confirmation?: {
label: string,
name: string,
placeholder: string,
} | null,
dependsOnAny?: boolean | null,
dependsOnKeys?: string[] | null,
disabled?: boolean | null,
hidden?: boolean | null,
label?: string | null,
labelAction?: {
href: string,
label: string,
tabIndex?: number,
} | null,
name: string,
passwordRules?: string | null,
placeholder?: string | null,
readonly?: boolean | null,
required?: boolean | null,
tabIndex?: number | null,
value?: any,
};
export type RichEditor = {
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnAny?: boolean | null,
dependsOnKeys?: string[] | null,
disabled?: boolean | null,
hidden?: boolean | null,
label?: string | null,
name: string,
placeholder?: string | null,
readonly?: boolean | null,
required?: boolean | null,
value?: any,
};
export type Select = {
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnAny?: boolean | null,
dependsOnKeys?: string[] | null,
disabled?: boolean | null,
hidden?: boolean | null,
label?: string | null,
multiple?: boolean | null,
name: string,
options?: {
label: string,
value: string,
}[],
placeholder?: string | null,
readonly?: boolean | null,
required?: boolean | null,
searchable?: boolean | null,
value?: any,
};
export type SortDirection = 'asc' | 'desc';
export type SubmitButton = {
label?: string | null,
variant?: string | null,
};
export type TableSort = {
readonly key: string,
readonly direction: SortDirection,
};
export type TextInput = {
autoComplete?: string | null,
autoFocus?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnAny?: boolean | null,
dependsOnKeys?: string[] | null,
disabled?: boolean | null,
hidden?: boolean | null,
label?: string | null,
name: string,
placeholder?: string | null,
readonly?: boolean | null,
required?: boolean | null,
tabIndex?: number | null,
type?: string | null,
value?: any,
};
export type Textarea = {
autoFocus?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnAny?: boolean | null,
dependsOnKeys?: string[] | null,
disabled?: boolean | null,
hidden?: boolean | null,
label?: string | null,
name: string,
placeholder?: string | null,
readonly?: boolean | null,
required?: boolean | null,
rows?: number | null,
tabIndex?: number | null,
value?: any,
};
export type ToastVariant = 'success' | 'info' | 'warning' | 'error';
export type Width = 'full' | 'sm' | 'md' | 'lg';
