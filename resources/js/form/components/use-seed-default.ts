import { useEffect } from "react";
import { useFormValue, useSetFormValue } from "./values";

/**
 * Seed a field's default into the store so dependent fields and the submitted
 * payload reflect it before the user interacts. Pass undefined to skip.
 */
export function useSeedDefault(name: string, value: unknown): void {
  const stored = useFormValue(name);
  const setValue = useSetFormValue();

  useEffect(() => {
    if (stored === undefined && value !== undefined) {
      setValue(name, value);
    }
  }, [name, value, stored, setValue]);
}
