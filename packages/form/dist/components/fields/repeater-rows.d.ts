export type RepeaterRow = Record<string, unknown>;
/**
 * Reserved per-row identity key: server-filled rows arrive with a uuid, the
 * client mints one for rows it creates, and it submits with the row so
 * validated data identifies every row.
 */
export declare const ROW_ID_KEY = "rowId";
export declare function withRowId(row: RepeaterRow): RepeaterRow;
/** Ensure every row has a stable id; returns the SAME array reference if none were missing. */
export declare function ensureRowIds(rows: RepeaterRow[]): RepeaterRow[];
export declare function seedRows(value: unknown, defaultItems: number): RepeaterRow[];
export declare function addRow(rows: RepeaterRow[]): RepeaterRow[];
export declare function removeRow(rows: RepeaterRow[], index: number): RepeaterRow[];
export declare function duplicateRow(rows: RepeaterRow[], index: number): RepeaterRow[];
export declare function moveRow(rows: RepeaterRow[], from: number, to: number): RepeaterRow[];
