import type { Node } from "@lattice-php/lattice/core/types";
import type { FieldState } from "./conditions";
import { fieldProps } from "./field-props";
import { useFieldScope } from "./field-scope";
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
  const scope = useFieldScope();
  const state = useDependentField(node);
  const props = fieldProps(node);
  const localName = props.name ?? "";

  const globalValue = useFormValue(localName);
  const storedValue = scope ? scope.getValue(localName) : globalValue;
  const currentValue = storedValue !== undefined ? storedValue : props.value;
  const value =
    typeof currentValue === "string" || typeof currentValue === "number"
      ? String(currentValue)
      : "";

  const domName = scope ? scope.scopedName(localName) : localName;
  const errorKey = scope ? scope.errorKey(localName) : localName;

  const { commit: commitField } = useFieldCommit();
  const commit = (next: unknown): void => commitField(localName, next);

  return { ...state, name: domName, value, error: errors[errorKey], commit };
}
