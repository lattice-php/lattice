import { createContext, useContext, useMemo } from "react";
import { appendPath, getPath, toHtmlName } from "@lattice-php/lattice/form/lib/form-path";
import { buildOverrideKey, rowIdFrom } from "@lattice-php/lattice/form/lib/override-keys";

type FieldScopeValue = {
  row: Record<string, unknown>;
  rowId: string | null;
  path: string;
  values: Record<string, unknown>;
  identityPath: string;
  getValue: (name: string) => unknown;
  setValue: (name: string, value: unknown) => void;
  scopedName: (name: string) => string;
  errorKey: (name: string) => string;
  overrideKey: (name: string) => string;
};

const FieldScopeContext = createContext<FieldScopeValue | null>(null);

function childCollectionIdentity(base: string, parent: FieldScopeValue | null): string {
  if (!parent) {
    return base;
  }

  const local = base.startsWith(`${parent.path}.`) ? base.slice(parent.path.length + 1) : base;

  return appendPath(parent.identityPath, local);
}

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
  const parent = useContext(FieldScopeContext);

  const value = useMemo<FieldScopeValue>(() => {
    const scopedRow = row ?? {};
    const rowId = rowIdFrom(scopedRow);
    const path = appendPath(base, index);
    const identityCollection = childCollectionIdentity(base, parent);
    const identityPath = appendPath(identityCollection, rowId ?? index);

    return {
      row: scopedRow,
      rowId,
      path,
      values: parent ? { ...parent.values, ...scopedRow } : scopedRow,
      identityPath,
      getValue: (name) => getPath(scopedRow, name),
      setValue: onChange,
      scopedName: (name) => toHtmlName(appendPath(path, name)),
      errorKey: (name) => appendPath(path, name),
      overrideKey: (name) => buildOverrideKey(identityCollection, rowId, index, name),
    };
  }, [base, index, row, onChange, parent]);

  return <FieldScopeContext.Provider value={value}>{children}</FieldScopeContext.Provider>;
}

/** Null outside a row so callers can preserve top-level behavior without a wrapper. */
export function useFieldScope(): FieldScopeValue | null {
  return useContext(FieldScopeContext);
}
