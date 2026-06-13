import { useFieldScope } from "./field-scope";
import { useFormContext } from "./context";
import { usePrefillController } from "./prefill-context";
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
 *
 * When called inside a `FieldScopeProvider`, writes go through the scope's
 * `setValue` and error paths use the scoped dot-key; outside a scope the
 * behavior is identical to before.
 */
export function useFieldCommit(): FieldCommit {
  const { clearErrors, precognitive, validate } = useFormContext();
  const setGlobal = useSetFormValue();
  const scope = useFieldScope();
  const prefill = usePrefillController();

  const write = (name: string, value: unknown): void => {
    if (scope) {
      scope.setValue(name, value);
    } else {
      setGlobal(name, value);
    }
    prefill?.markUserEdit(scope ? scope.overrideKey(name) : name);
  };
  const errorPath = (name: string): string => (scope ? scope.errorKey(name) : name);

  return {
    commit(name, value) {
      write(name, value);
      if (precognitive) {
        validate(errorPath(name));
      } else {
        clearErrors(errorPath(name));
      }
    },
    change(name, value) {
      write(name, value);
      clearErrors(errorPath(name));
    },
    blur(name) {
      if (precognitive) {
        validate(errorPath(name));
      }
    },
  };
}
