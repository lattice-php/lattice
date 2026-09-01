import type { Affix, Node, Op, Option } from "@lattice-php/core";
import type {
  Align,
  ColumnWidth,
  Emphasis,
  HttpMethod,
  Justify,
  Orientation,
  Variant,
} from "@lattice-php/ui";

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
  labelAction: Node | null;
  layout: RowLayout;
  maxItems: number | null;
  minItems: number | null;
  name: string;
  nestedRowsKey: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  reorderable: boolean;
  required: boolean;
  resizableColumns: boolean;
  resizeIndicator: boolean;
  rowActions: RowAction[] | null;
  templates: RowTemplateData[];
  tooltip: string | null;
  value: unknown;
};
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
  labelAction: Node | null;
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
  labelAction: Node | null;
  name: string;
  optionSchema: Node[] | null;
  options: Option[];
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  tabIndex: number | null;
  tooltip: string | null;
  value: unknown;
};
export type ColorPicker = {
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  labelAction: Node | null;
  name: string;
  palette: string[];
  placeholder: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  tooltip: string | null;
  value: unknown;
};
export type ComponentPropsMap = {
  "field.builder": Builder;
  "field.checkbox": Checkbox;
  "field.choice": Choice;
  "field.color-picker": ColorPicker;
  "field.date-input": DateInput;
  "field.date-time-input": DateTimeInput;
  "field.file-upload": FileUpload;
  "field.hidden-input": HiddenInput;
  "field.number-input": NumberInput;
  "field.otp": OtpInput;
  "field.password-input": PasswordInput;
  "field.pattern-input": PatternInput;
  "field.repeater": Repeater;
  "field.rich-editor": RichEditor;
  "field.select": Select;
  "field.text-input": TextInput;
  "field.textarea": Textarea;
  "field.time-input": TimeInput;
  "field.toggle": Toggle;
  form: Form;
  wizard: Wizard;
  "wizard-step": WizardStep;
};
export type Condition = {
  readonly field: string;
  readonly operator: Op;
  readonly value: unknown;
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
  labelAction: Node | null;
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
  labelAction: Node | null;
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
export type EditorBlockquote = Record<string, never>;
export type EditorBold = Record<string, never>;
export type EditorBulletList = Record<string, never>;
export type EditorCode = Record<string, never>;
export type EditorCodeBlock = Record<string, never>;
export type EditorDetails = Record<string, never>;
export type EditorEmoji = {
  emojis: string[];
};
export type EditorExtension = {
  type: string;
  props: Record<string, unknown>;
};
export type EditorExtensionPropsMap = {
  blockquote: EditorBlockquote;
  bold: EditorBold;
  "bullet-list": EditorBulletList;
  code: EditorCode;
  "code-block": EditorCodeBlock;
  details: EditorDetails;
  emoji: EditorEmoji;
  heading: EditorHeading;
  highlight: EditorHighlight;
  "horizontal-rule": EditorHorizontalRule;
  italic: EditorItalic;
  link: EditorLink;
  "ordered-list": EditorOrderedList;
  "slash-menu": EditorSlashMenu;
  strike: EditorStrike;
  table: EditorTable;
  "text-align": EditorTextAlign;
  underline: EditorUnderline;
};
export type EditorHeading = {
  levels: number[];
};
export type EditorHighlight = Record<string, never>;
export type EditorHorizontalRule = Record<string, never>;
export type EditorItalic = Record<string, never>;
export type EditorLink = {
  openOnClick: boolean;
  protocols: string[];
};
export type EditorOrderedList = Record<string, never>;
export type EditorSlashMenu = Record<string, never>;
export type EditorStrike = Record<string, never>;
export type EditorTable = {
  cols: number;
  rows: number;
  withHeaderRow: boolean;
};
export type EditorTextAlign = {
  alignments: string[];
};
export type EditorUnderline = Record<string, never>;
export type FieldConditions = {
  readonly disabled: Condition[];
  readonly readOnly: Condition[];
  readonly required: Condition[];
  readonly visible: Condition[];
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
        size: number | null;
        token: string;
        url: string | null;
      }[]
    | null;
  helperText: string | null;
  image: boolean;
  label: string | null;
  labelAction: Node | null;
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
export type Form = {
  action: string | null;
  async: boolean;
  errorBag: string | null;
  method: HttpMethod | null;
  precognitive: boolean;
  ref: string | null;
  resetOnError: string[] | boolean | null;
  resetOnSuccess: string[] | boolean | null;
  state: Record<string, unknown>;
  status: string | null;
  submitButton: boolean;
  submitButtons: Node<"button">[] | null;
  submitEmphasis: Emphasis | null;
  submitJustify: Justify | null;
  submitLabel: string | null;
  submitVariant: Variant | null;
  validationSummaryLabel: string;
  validationTimeout: number | null;
};
export type FormFieldNodeType =
  | "field.builder"
  | "field.checkbox"
  | "field.choice"
  | "field.color-picker"
  | "field.date-input"
  | "field.date-time-input"
  | "field.file-upload"
  | "field.hidden-input"
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
export type HiddenInput = {
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  labelAction: Node | null;
  name: string;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  tooltip: string | null;
  value: unknown;
};
export type NodeType =
  | "field.builder"
  | "field.checkbox"
  | "field.choice"
  | "field.color-picker"
  | "field.date-input"
  | "field.date-time-input"
  | "field.file-upload"
  | "field.hidden-input"
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
  labelAction: Node | null;
  max: number | null;
  min: number | null;
  name: string;
  placeholder: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  prefix: Affix | null;
  prefixFieldName: string | null;
  readOnly: boolean;
  required: boolean;
  slider: boolean;
  step: number | null;
  suffix: Affix | null;
  suffixFieldName: string | null;
  tabIndex: number | null;
  tooltip: string | null;
  value: unknown;
};
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
  labelAction: Node | null;
  length: number;
  name: string;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  tooltip: string | null;
  value: unknown;
};
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
  labelAction: Node | null;
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
export type PatternInput = {
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  labelAction: Node | null;
  name: string;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  separator: string;
  tokens: PatternTokenData[];
  tooltip: string | null;
  value: unknown;
};
export type PatternTokenData = {
  readonly label: string;
  readonly name: string;
  readonly schema: Node[];
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
  itemLabels: (string | null)[] | null;
  label: string | null;
  labelAction: Node | null;
  layout: RowLayout;
  maxItems: number | null;
  minItems: number | null;
  name: string;
  nestedRowsKey: string | null;
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
export type ResolveResponse = {
  readonly fields: Record<string, Node>;
  readonly prefill: Record<string, unknown>;
  readonly values: Record<string, unknown>;
};
export type RichEditor = {
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  extensions: EditorExtension[];
  helperText: string | null;
  label: string | null;
  labelAction: Node | null;
  name: string;
  placeholder: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  toolbar: boolean;
  tooltip: string | null;
  value: unknown;
};
export type RowAction = {
  danger: boolean;
  icon: string | null;
  key: string;
  label: string | null;
  type: RowActionType;
};
export type RowActionType = "duplicate" | "remove";
export type RowLayout = "stack" | "table";
export type RowTemplateData = {
  readonly label: string;
  readonly schema: Node[];
  readonly type: string;
};
export type Select = {
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  creatable: boolean;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  emptyLabel: string;
  helperText: string | null;
  label: string | null;
  labelAction: Node | null;
  multiple: boolean;
  name: string;
  optionSchema: Node[] | null;
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
export type SignedUpload = {
  readonly headers: Record<string, unknown>;
  readonly key: string;
  readonly method: HttpMethod;
  readonly url: string;
};
export type TextInput = {
  autoComplete: string | null;
  autoFocus: boolean;
  columnWidth: ColumnWidth;
  conditions: FieldConditions | null;
  copyable: boolean;
  dependsOnAny: boolean;
  dependsOnKeys: string[] | null;
  disabled: boolean;
  editablePrefill: boolean;
  helperText: string | null;
  label: string | null;
  labelAction: Node | null;
  name: string;
  placeholder: string | null;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  prefix: Affix | null;
  prefixFieldName: string | null;
  readOnly: boolean;
  required: boolean;
  suffix: Affix | null;
  suffixFieldName: string | null;
  tabIndex: number | null;
  tooltip: string | null;
  type: string | null;
  value: unknown;
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
  labelAction: Node | null;
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
  labelAction: Node | null;
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
  labelAction: Node | null;
  name: string;
  prefillRefreshOn: string[] | null;
  prefillResetOn: string[] | null;
  readOnly: boolean;
  required: boolean;
  tabIndex: number | null;
  tooltip: string | null;
  value: unknown;
};
export type Wizard = {
  align: Align;
  orientation: Orientation;
};
export type WizardStep = {
  description: string | null;
  label: string;
  name: string;
};
