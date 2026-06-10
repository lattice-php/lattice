export type Align = 'center' | 'left' | 'start' | 'stretch';
export type Checkbox = {
name: string,
label?: string | null,
value?: any,
hidden?: boolean | null,
required?: boolean | null,
readonly?: boolean | null,
disabled?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnKeys?: string[] | null,
dependsOnAny?: boolean | null,
tabIndex?: number | null,
};
export type Choice = {
name: string,
label?: string | null,
value?: any,
hidden?: boolean | null,
required?: boolean | null,
readonly?: boolean | null,
disabled?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnKeys?: string[] | null,
dependsOnAny?: boolean | null,
options?: {
label: string,
value: string,
}[],
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
min?: string | null,
max?: string | null,
name: string,
label?: string | null,
value?: any,
hidden?: boolean | null,
required?: boolean | null,
readonly?: boolean | null,
disabled?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnKeys?: string[] | null,
dependsOnAny?: boolean | null,
autoFocus?: boolean | null,
tabIndex?: number | null,
};
export type EffectType = 'toast' | 'reloadComponent' | 'reloadPage' | 'redirect' | 'download' | 'openModal' | 'closeModal' | 'resetForm';
export type FilterOperator = 'contains' | 'starts_with' | 'ends_with' | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'before' | 'after' | 'empty' | 'filled';
export type FilterType = 'text' | 'number' | 'date' | 'boolean';
export type Form = {
action?: string | null,
method?: string | null,
submitLabel?: string | null,
precognitive?: boolean | null,
validationTimeout?: number | null,
submitButton?: boolean | null,
resetOnSuccess?: string[] | boolean | null,
resetOnError?: string[] | boolean | null,
status?: string | null,
errorBag?: string | null,
state?: Record<string, any>,
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
name: string,
label?: string | null,
value?: any,
hidden?: boolean | null,
required?: boolean | null,
readonly?: boolean | null,
disabled?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnKeys?: string[] | null,
dependsOnAny?: boolean | null,
};
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type NumberInput = {
min?: number | null,
max?: number | null,
step?: number | null,
slider?: boolean | null,
name: string,
label?: string | null,
value?: any,
hidden?: boolean | null,
required?: boolean | null,
readonly?: boolean | null,
disabled?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnKeys?: string[] | null,
dependsOnAny?: boolean | null,
autoFocus?: boolean | null,
placeholder?: string | null,
tabIndex?: number | null,
};
export type PageContainer = 'centered' | 'default';
export type PageLayout = 'app' | 'auth' | 'none';
export type PaginationType = 'none' | 'simple' | 'table' | 'infinite';
export type PasswordInput = {
passwordRules?: string | null,
labelAction?: {
href: string,
label: string,
tabIndex?: number,
} | null,
confirmation?: {
label: string,
name: string,
placeholder: string,
} | null,
name: string,
label?: string | null,
value?: any,
hidden?: boolean | null,
required?: boolean | null,
readonly?: boolean | null,
disabled?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnKeys?: string[] | null,
dependsOnAny?: boolean | null,
autoComplete?: string | null,
autoFocus?: boolean | null,
placeholder?: string | null,
tabIndex?: number | null,
};
export type RichEditor = {
name: string,
label?: string | null,
value?: any,
hidden?: boolean | null,
required?: boolean | null,
readonly?: boolean | null,
disabled?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnKeys?: string[] | null,
dependsOnAny?: boolean | null,
placeholder?: string | null,
};
export type Select = {
multiple?: boolean | null,
searchable?: boolean | null,
name: string,
label?: string | null,
value?: any,
hidden?: boolean | null,
required?: boolean | null,
readonly?: boolean | null,
disabled?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnKeys?: string[] | null,
dependsOnAny?: boolean | null,
options?: {
label: string,
value: string,
}[],
placeholder?: string | null,
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
type?: string | null,
name: string,
label?: string | null,
value?: any,
hidden?: boolean | null,
required?: boolean | null,
readonly?: boolean | null,
disabled?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnKeys?: string[] | null,
dependsOnAny?: boolean | null,
autoComplete?: string | null,
autoFocus?: boolean | null,
placeholder?: string | null,
tabIndex?: number | null,
};
export type Textarea = {
rows?: number | null,
name: string,
label?: string | null,
value?: any,
hidden?: boolean | null,
required?: boolean | null,
readonly?: boolean | null,
disabled?: boolean | null,
conditions?: Record<string, {
field: string,
operator: string,
value: any,
}[]> | null,
dependsOnKeys?: string[] | null,
dependsOnAny?: boolean | null,
autoFocus?: boolean | null,
placeholder?: string | null,
tabIndex?: number | null,
};
export type ToastVariant = 'success' | 'info' | 'warning' | 'error';
export type Width = 'full' | 'sm' | 'md' | 'lg';
