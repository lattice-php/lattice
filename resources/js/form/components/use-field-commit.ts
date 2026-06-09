import { useFormContext } from "./context";
import { useSetFormValue } from "./values";

export type FieldCommit = {
  /** Write the value and validate immediately (precognitive) or clear errors. */
  commit: (name: string, value: unknown) => void;
  /** Write the value and clear errors, deferring validation to a later `blur`. */
  change: (name: string, value: unknown) => void;
  /** Validate the field now if precognitive (e.g. on blur or popover close). */
  blur: (name: string) => void;
};

/**
 * The shared field-mutation contract every form field uses to write its value
 * and drive precognition. Fields that validate on change call `commit`; fields
 * that validate on blur/close (rich editor, select) call `change` then `blur`.
 */
export function useFieldCommit(): FieldCommit {
  const { clearErrors, precognitive, validate } = useFormContext();
  const setValue = useSetFormValue();

  return {
    commit(name, value) {
      setValue(name, value);
      if (precognitive) {
        validate(name);
      } else {
        clearErrors(name);
      }
    },
    change(name, value) {
      setValue(name, value);
      clearErrors(name);
    },
    blur(name) {
      if (precognitive) {
        validate(name);
      }
    },
  };
}
