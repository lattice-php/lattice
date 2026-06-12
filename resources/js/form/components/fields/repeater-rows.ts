export type RepeaterRow = Record<string, unknown>;

/** Seed the row list from a stored value, falling back to `defaultItems` blank rows. */
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

export function moveRow(rows: RepeaterRow[], from: number, to: number): RepeaterRow[] {
  const next = [...rows];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
