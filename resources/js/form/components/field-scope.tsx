import { createContext, useContext, useMemo } from "react";

export type FieldScopeValue = {
  getValue: (name: string) => unknown;
  setValue: (name: string, value: unknown) => void;
  scopedName: (name: string) => string;
  errorKey: (name: string) => string;
};

const FieldScopeContext = createContext<FieldScopeValue | null>(null);

export function FieldScopeProvider({
  base,
  index,
  row,
  onChange,
  children,
}: {
  base: string;
  index: number;
  row: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  children: React.ReactNode;
}) {
  const value = useMemo<FieldScopeValue>(
    () => ({
      getValue: (name) => row[name],
      setValue: onChange,
      scopedName: (name) => `${base}[${index}][${name}]`,
      errorKey: (name) => `${base}.${index}.${name}`,
    }),
    [base, index, row, onChange],
  );

  return <FieldScopeContext.Provider value={value}>{children}</FieldScopeContext.Provider>;
}

/** Null when not inside a repeater row — callers fall back to the global flat store. */
export function useFieldScope(): FieldScopeValue | null {
  return useContext(FieldScopeContext);
}
