import { type FormatOptions, formatDateValue } from "@lattice-php/ui/format/temporal";
import type {
  ColumnPropsOf,
  CommonColumnProps,
  TableColumn,
  TableRow,
} from "@lattice-php/table/types";

export function formatCell(value: unknown, column?: TableColumn, options?: FormatOptions): string {
  if (value === null || value === undefined) {
    return "";
  }

  const date = (column?.props as ColumnPropsOf<"column.text"> | null)?.date;

  if (date) {
    return formatDateValue(value, date, options);
  }

  const label = (column?.props as CommonColumnProps | undefined)?.options?.find(
    (option) => option.value === String(value),
  )?.label;

  if (label !== undefined) {
    return label;
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

  let unresolved = false;

  const resolved = href.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const raw = key === "value" ? value : row[key];

    if (raw === null || raw === undefined || raw === "") {
      unresolved = true;
      return "";
    }

    return encodeURIComponent(String(raw));
  });

  return unresolved ? null : resolved;
}
