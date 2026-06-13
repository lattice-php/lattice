import { useCallback, useEffect } from "react";
import { useFormValue, useSetFormValue } from "../values";
import {
  ensureRowIds,
  moveRow,
  removeRow,
  seedRows,
  withRowId,
  type RepeaterRow,
} from "./repeater-rows";

export type RowCollection = {
  rows: RepeaterRow[];
  onField: (index: number, field: string, value: unknown) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, delta: number) => void;
  append: (row: RepeaterRow) => void;
};

export function useRowCollection(name: string, defaultItems: number): RowCollection {
  const setValue = useSetFormValue();
  const stored = useFormValue(name);
  const raw: RepeaterRow[] = Array.isArray(stored) ? stored : seedRows(stored, defaultItems);
  const rows = ensureRowIds(raw);

  useEffect(() => {
    if (rows !== raw) {
      setValue(name, rows);
    }
  }, [raw, rows, setValue, name]);

  // Functional store updates preserve the identity of untouched rows, which lets
  // the memoised RowItem skip re-rendering siblings on a single-row edit.
  const mutate = useCallback(
    (fn: (rows: RepeaterRow[]) => RepeaterRow[]): void => {
      setValue(name, (prev: unknown) =>
        fn(Array.isArray(prev) ? (prev as RepeaterRow[]) : seedRows(prev, defaultItems)),
      );
    },
    [setValue, name, defaultItems],
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
  const append = useCallback(
    (row: RepeaterRow): void => mutate((current) => [...current, withRowId(row)]),
    [mutate],
  );

  return { rows, onField, onRemove, onMove, append };
}
