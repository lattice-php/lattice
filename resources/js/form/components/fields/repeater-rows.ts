export type RepeaterRow = Record<string, unknown>;

export const ROW_ID_KEY = "__rowId";

let rowIdCounter = 0;

export function withRowId(row: RepeaterRow): RepeaterRow {
  return row[ROW_ID_KEY] ? row : { ...row, [ROW_ID_KEY]: `r${rowIdCounter++}` };
}

/** Ensure every row has a stable id; returns the SAME array reference if none were missing. */
export function ensureRowIds(rows: RepeaterRow[]): RepeaterRow[] {
  if (rows.every((row) => Boolean(row[ROW_ID_KEY]))) {
    return rows;
  }
  return rows.map(withRowId);
}

export function seedRows(value: unknown, defaultItems: number): RepeaterRow[] {
  if (Array.isArray(value) && value.length > 0) {
    return value.map((row) => (row && typeof row === "object" ? { ...(row as RepeaterRow) } : {}));
  }

  return Array.from({ length: Math.max(0, defaultItems) }, () => ({}));
}

export function addRow(rows: RepeaterRow[]): RepeaterRow[] {
  return [...rows, {}];
}

export function removeRow(rows: RepeaterRow[], index: number): RepeaterRow[] {
  return rows.filter((_, i) => i !== index);
}

export function duplicateRow(rows: RepeaterRow[], index: number): RepeaterRow[] {
  const source = rows[index];
  if (!source) {
    return rows;
  }

  const { [ROW_ID_KEY]: _id, ...copy } = source;
  return [...rows.slice(0, index + 1), withRowId(copy), ...rows.slice(index + 1)];
}

export function moveRow(rows: RepeaterRow[], from: number, to: number): RepeaterRow[] {
  const next = [...rows];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
