/**
 * The blessed client toolkit for building custom form fields outside the core
 * package — row fields especially. Everything re-exported here is public API
 * with the same stability promise as the PHP RowsField hierarchy; form modules
 * NOT re-exported here are internal and may change without notice.
 */
export { FormFieldFrame } from "./components/base/field";
export { useFormContext } from "./components/context";
export { FieldScopeProvider, useFieldScope } from "./components/field-scope";
export { fieldProps, walkFields } from "./components/field-props";
export { appendPath, getPath, setPath, toHtmlName } from "./components/form-path";
export { registerRowCollectionType } from "./components/prefill-targets";
export { AddRowMenu, type AddRowOption } from "./components/fields/add-row-menu";
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
} from "./components/fields/repeater-rows";
export { RowIdInputs } from "./components/fields/row-id-inputs";
export { useRowCollection } from "./components/fields/use-row-collection";
export { useDependentField } from "./components/use-dependent-field";
export { useFieldCommit } from "./components/use-field-commit";
export { useFormValue, useFormValues, useSetFormValue } from "./components/values";
