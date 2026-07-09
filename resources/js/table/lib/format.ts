import { type FormatOptions, formatDateValue } from "@lattice-php/lattice/format/date-time";
import type { ColumnPropsOf, TableColumn, TableRow } from "../types";

export function formatCell(value: unknown, column?: TableColumn, options?: FormatOptions): string {
  if (value === null || value === undefined) {
    return "";
  }

  const date = (column?.props as ColumnPropsOf<"column.text"> | null)?.date;

  if (date) {
    return formatDateValue(value, date, options);
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

export function resolveLink(column: TableColumn, row: TableRow, value: unknown): string | null {
  const link = (column.props as ColumnPropsOf<"column.text">).link;

  if (!link) {
    return null;
  }

  const href = link.href ?? String(value ?? "");

  if (href === "") {
    return null;
  }

  return href.replace(/\{([^}]+)\}/g, (_, key: string) => {
    if (key === "value") {
      return encodeURIComponent(String(value ?? ""));
    }

    return encodeURIComponent(String(row[key] ?? ""));
  });
}
