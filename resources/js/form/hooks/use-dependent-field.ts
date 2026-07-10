import type { Node } from "@lattice-php/lattice/core/types";
import { useMemo } from "react";
import { conditionFields, type FieldState, evaluateConditions } from "../lib/conditions";
import { fieldProps } from "../lib/field-props";
import { useFieldScope } from "./field-scope";
import { useFormValuesFor } from "./values";

export function useDependentField(node: Node): FieldState {
  const scope = useFieldScope();
  const props = fieldProps(node);
  const fields = useMemo(() => conditionFields(props.conditions), [props.conditions]);
  const values = useFormValuesFor(fields);
  // Bare condition names resolve to row siblings first; form values remain the fallback.
  const conditionValues = scope ? { ...values, ...scope.values } : values;

  return evaluateConditions(props.conditions ?? undefined, conditionValues, {
    required: props.required ?? false,
    readOnly: props.readOnly ?? false,
    disabled: props.disabled ?? false,
  });
}
