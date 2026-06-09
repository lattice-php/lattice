import { getStringProp } from "@lattice/core/props";
import type { Node } from "@lattice/core/types";
import type { FieldState } from "./conditions";
import { useFormContext } from "./context";
import { useDependentField } from "./use-dependent-field";
import { useFormValue, useSetFormValue } from "./values";

type ControlledField = FieldState & {
  name: string;
  value: string;
  error?: string;
  commit: (value: unknown) => void;
};

/**
 * Shared wiring for store-controlled, condition-aware fields: derives the current
 * string value (store, falling back to the node's value prop), the field state
 * (hidden/required/readonly/disabled), the current error, and a `commit` callback
 * that writes to the store and triggers precognition validation / error clearing.
 */
export function useControlledField(node: Node): ControlledField {
  const { clearErrors, errors, precognitive, validate } = useFormContext();
  const state = useDependentField(node);
  const name = getStringProp(node.props, "name");
  const setValue = useSetFormValue();
  const storedValue = useFormValue(name);
  const currentValue = storedValue !== undefined ? storedValue : node.props?.value;
  const value =
    typeof currentValue === "string" || typeof currentValue === "number"
      ? String(currentValue)
      : "";

  const commit = (next: unknown): void => {
    setValue(name, next);
    if (precognitive) {
      validate(name);
    } else {
      clearErrors(name);
    }
  };

  return { ...state, name, value, error: errors[name], commit };
}
