import type { Node } from "@lattice/lattice/core/types";
import { type FieldState, evaluateConditions } from "./conditions";
import { fieldProps } from "./field-props";
import { useFieldScope } from "./field-scope";
import { useFormValues } from "./values";

export function useDependentField(node: Node): FieldState {
  const values = useFormValues();
  const scope = useFieldScope();
  const props = fieldProps(node);
  const conditionValues = scope ? { ...values, ...scope.row } : values;

  return evaluateConditions(props.conditions ?? undefined, conditionValues, {
    hidden: props.hidden ?? false,
    required: props.required ?? false,
    readOnly: props.readOnly ?? false,
    disabled: props.disabled ?? false,
  });
}
