import { createContext, useContext, useMemo } from "react";
import { ROW_ID_KEY } from "./fields/repeater-rows";

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
    const rowId = typeof row[ROW_ID_KEY] === "string" ? row[ROW_ID_KEY] : null;

    return {
      row,
      rowId,
      getValue: (name) => row[name],
      setValue: onChange,
      scopedName: (name) => `${base}[${index}][${name}]`,
      errorKey: (name) => `${base}.${index}.${name}`,
      overrideKey: (name) => (rowId ? `${base}.${rowId}.${name}` : `${base}.${index}.${name}`),
    };
  }, [base, index, row, onChange]);

  return <FieldScopeContext.Provider value={value}>{children}</FieldScopeContext.Provider>;
}

export function useFieldScope(): FieldScopeValue | null {
  return useContext(FieldScopeContext);
}
