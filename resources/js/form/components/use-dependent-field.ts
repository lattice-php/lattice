import { getBooleanProp } from "@bambamboole/lattice/core/props";
import type { Node } from "@bambamboole/lattice/core/types";
import { type FieldConditions, type FieldState, evaluateConditions } from "./conditions";
import { useFormValues } from "./values";

export function useDependentField(node: Node): FieldState {
  const values = useFormValues();
  const conditions = node.props?.conditions as FieldConditions | undefined;

  return evaluateConditions(conditions, values, {
    hidden: getBooleanProp(node.props, "hidden"),
    required: getBooleanProp(node.props, "required"),
    readonly: getBooleanProp(node.props, "readonly"),
    disabled: getBooleanProp(node.props, "disabled"),
  });
}
