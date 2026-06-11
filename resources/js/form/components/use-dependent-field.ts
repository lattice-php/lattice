import type { Node } from "@lattice/lattice/core/types";
import { type FieldState, evaluateConditions } from "./conditions";
import { fieldProps } from "./field-props";
import { useFormValues } from "./values";

export function useDependentField(node: Node): FieldState {
  const values = useFormValues();
  const props = fieldProps(node);

  return evaluateConditions(props.conditions ?? undefined, values, {
    hidden: props.hidden ?? false,
    required: props.required ?? false,
    readonly: props.readonly ?? false,
    disabled: props.disabled ?? false,
  });
}
