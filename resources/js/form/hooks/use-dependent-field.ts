import type { Node } from "@lattice-php/lattice/core/types";
import { type FieldState, evaluateConditions } from "../lib/conditions";
import { fieldProps } from "../lib/field-props";
import { useFieldScope } from "./field-scope";
import { useFormValues } from "./values";

export function useDependentField(node: Node): FieldState {
  const values = useFormValues();
  const scope = useFieldScope();
  const props = fieldProps(node);
  // Bare condition names resolve to row siblings first; form values remain the fallback.
  const conditionValues = scope ? { ...values, ...scope.values } : values;

  return evaluateConditions(props.conditions ?? undefined, conditionValues, {
    hidden: props.hidden ?? false,
    required: props.required ?? false,
    readOnly: props.readOnly ?? false,
    disabled: props.disabled ?? false,
  });
}
