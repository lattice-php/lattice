import type { Node } from "@lattice/lattice/core/types";
import type { FieldState } from "./conditions";
import { fieldProps } from "./field-props";
import { useFormContext } from "./context";
import { useDependentField } from "./use-dependent-field";
import { useFieldCommit } from "./use-field-commit";
import { useFormValue } from "./values";

export type ControlledField = FieldState & {
  name: string;
  value: string;
  error?: string;
  commit: (value: unknown) => void;
};

/** Shared wiring read by every store-controlled, condition-aware field. */
export function useControlledField(node: Node): ControlledField {
  const { errors } = useFormContext();
  const state = useDependentField(node);
  const props = fieldProps(node);
  const name = props.name ?? "";
  const storedValue = useFormValue(name);
  const currentValue = storedValue !== undefined ? storedValue : props.value;
  const value =
    typeof currentValue === "string" || typeof currentValue === "number"
      ? String(currentValue)
      : "";

  const { commit: commitField } = useFieldCommit();
  const commit = (next: unknown): void => commitField(name, next);

  return { ...state, name, value, error: errors[name], commit };
}
