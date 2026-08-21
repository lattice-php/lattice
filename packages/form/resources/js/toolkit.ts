/**
 * Entry point for building custom form fields outside the package. Form
 * modules not re-exported here are internal and may change without notice.
 */
export { FormFieldFrame, type FormFieldControlProps } from "./components/base/field";
export { useFormContext } from "./hooks/context";
export { FieldScopeProvider, useFieldScope } from "./hooks/field-scope";
export { fieldProps, walkFields } from "./lib/field-props";
export { appendPath, getPath, setPath, toHtmlName } from "./lib/form-path";
export { AddRowMenu, type AddRowOption } from "./components/rows/add-row-menu";
export {
  ROW_ID_KEY,
  addRow,
  duplicateRow,
  ensureRowIds,
  moveRow,
  removeRow,
  seedRows,
  withRowId,
  type RepeaterRow,
} from "./components/rows/repeater-rows";
export { RowKeyInputs } from "./components/rows/row-key-inputs";
export { rowSchemaFor, rowTemplatesOf } from "./components/rows/row-templates";
export type { RowTemplateData } from "./generated";
export { useRowCollection } from "./components/rows/use-row-collection";
export { useDependentField } from "./hooks/use-dependent-field";
export { useFieldCommit } from "./hooks/use-field-commit";
export { useFormValue, useFormValues, useSetFormValue } from "./hooks/values";
