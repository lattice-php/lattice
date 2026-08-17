import { useEffect } from "react";
import { useFieldScope } from "./field-scope";
import { useFormValue, useSetFormValue } from "./values";

/**
 * Seed a field's default into the store so dependent fields and the submitted
 * payload reflect it before the user interacts. Pass undefined to skip.
 *
 * A field with no server-side value serializes as `null`, not as a missing key,
 * so the store already holds `null` by the time this runs. Both count as unset:
 * seeding only on `undefined` would leave the store disagreeing with the control
 * the user is looking at, and a dependent field would resolve against nothing.
 */
export function useSeedDefault(name: string, value: unknown): void {
  const scope = useFieldScope();
  const globalStored = useFormValue(name);
  const stored = scope ? scope.getValue(name) : globalStored;
  const setValue = useSetFormValue();

  useEffect(() => {
    if ((stored === undefined || stored === null) && value !== undefined) {
      if (scope) {
        scope.setValue(name, value);
      } else {
        setValue(name, value);
      }
    }
  }, [name, value, stored, setValue, scope]);
}
