import { createContext, useContext, useMemo } from "react";
import { buildOverrideKey, rowIdFrom } from "./override-keys";

export type FieldScopeValue = {
  row: Record<string, unknown>;
  rowId: string | null;
  getValue: (name: string) => unknown;
  setValue: (name: string, value: unknown) => void;
  scopedName: (name: string) => string;
  errorKey: (name: string) => string;
  overrideKey: (name: string) => string;
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
  const value = useMemo<FieldScopeValue>(() => {
    const rowId = rowIdFrom(row);

    return {
      row,
      rowId,
      getValue: (name) => row[name],
      setValue: onChange,
      scopedName: (name) => `${base}[${index}][${name}]`,
      errorKey: (name) => `${base}.${index}.${name}`,
      overrideKey: (name) => buildOverrideKey(base, rowId, index, name),
    };
  }, [base, index, row, onChange]);

  return <FieldScopeContext.Provider value={value}>{children}</FieldScopeContext.Provider>;
}

/** Null outside a row so callers can preserve top-level behavior without a wrapper. */
export function useFieldScope(): FieldScopeValue | null {
  return useContext(FieldScopeContext);
}
