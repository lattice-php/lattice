import { useEffect } from "react";
import { useFormValue, useSetFormValue } from "./values";

/**
 * Seed the form store with a field's default value when nothing is stored yet,
 * so dependent fields and the submitted payload reflect it before the user
 * interacts. Pass undefined as the value to skip seeding.
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
