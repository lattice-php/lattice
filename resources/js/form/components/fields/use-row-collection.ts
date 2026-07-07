import { useCallback, useLayoutEffect } from "react";
import { useFieldScope } from "../field-scope";
import { useFormValue, useSetFormValue } from "../values";
import {
  duplicateRow,
  ensureRowIds,
  moveRow,
  removeRow,
  seedRows,
  withRowId,
  type RepeaterRow,
} from "./repeater-rows";

type RowCollection = {
  path: string;
  rows: RepeaterRow[];
  onField: (index: number, field: string, value: unknown) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, delta: number) => void;
  onDuplicate: (index: number) => void;
  append: (row: RepeaterRow) => void;
};

export function useRowCollection(name: string, defaultItems: number): RowCollection {
  const scope = useFieldScope();
  const path = scope ? scope.errorKey(name) : name;
  const setValue = useSetFormValue();
  const stored = useFormValue(path);
  const raw: RepeaterRow[] = Array.isArray(stored) ? stored : seedRows(stored, defaultItems);
  const rows = ensureRowIds(raw);

  useLayoutEffect(() => {
    if (rows !== raw) {
      setValue(path, rows);
    }
  }, [raw, rows, setValue, path]);

  // Functional store updates preserve the identity of untouched rows, which lets
  // the memoised RowItem skip re-rendering siblings on a single-row edit.
  const mutate = useCallback(
    (fn: (rows: RepeaterRow[]) => RepeaterRow[]): void => {
      setValue(path, (prev: unknown) =>
        fn(Array.isArray(prev) ? (prev as RepeaterRow[]) : seedRows(prev, defaultItems)),
      );
    },
    [setValue, path, defaultItems],
  );

  const onField = useCallback(
    (index: number, field: string, value: unknown): void =>
      mutate((current) => current.map((r, i) => (i === index ? { ...r, [field]: value } : r))),
    [mutate],
  );
  const onRemove = useCallback(
    (index: number): void => mutate((current) => removeRow(current, index)),
    [mutate],
  );
  const onMove = useCallback(
    (index: number, delta: number): void =>
      mutate((current) => moveRow(current, index, index + delta)),
    [mutate],
  );
  const onDuplicate = useCallback(
    (index: number): void => mutate((current) => duplicateRow(current, index)),
    [mutate],
  );
  const append = useCallback(
    (row: RepeaterRow): void => mutate((current) => [...current, withRowId(row)]),
    [mutate],
  );

  return { path, rows, onField, onRemove, onMove, onDuplicate, append };
}
