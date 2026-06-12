import type { TableColumn } from "../../types";

/** Read a `{ value: x }` lookup stored in a column's props (badge colours, icon names). */
export function columnMap(column: TableColumn, key: string): Record<string, string> {
  const value = column.props?.[key];

  return value && typeof value === "object" ? (value as Record<string, string>) : {};
}
