import { useEffect } from "react";
import { useFieldScope } from "./field-scope";
import { useFormValue, useSetFormValue } from "./values";

/**
 * Seed a field's default into the store so dependent fields and the submitted
 * payload reflect it before the user interacts. Pass undefined to skip.
 */
export function useSeedDefault(name: string, value: unknown): void {
  const scope = useFieldScope();
  const globalStored = useFormValue(name);
  const stored = scope ? scope.getValue(name) : globalStored;
  const setValue = useSetFormValue();

  useEffect(() => {
    if (stored === undefined && value !== undefined) {
      if (scope) {
        scope.setValue(name, value);
      } else {
        setValue(name, value);
      }
    }
  }, [name, value, stored, setValue, scope]);
}
