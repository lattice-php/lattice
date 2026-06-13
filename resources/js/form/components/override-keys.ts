import { ROW_ID_KEY } from "./fields/repeater-rows";

export function rowIdFrom(row: Record<string, unknown>): string | null {
  return typeof row[ROW_ID_KEY] === "string" ? row[ROW_ID_KEY] : null;
}

export function buildOverrideKey(
  base: string,
  rowId: string | null,
  index: number,
  name: string,
): string {
  return `${base}.${rowId ?? String(index)}.${name}`;
}
