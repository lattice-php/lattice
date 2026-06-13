import type { TextColumnProps } from "@lattice-php/lattice/types/generated";
import type { TableColumn, TableRow } from "./types";

export function formatCell(value: unknown, column?: TableColumn): string {
  if (value === null || value === undefined) {
    return "";
  }

  const date = (column?.props as TextColumnProps | null)?.date;

  if (date) {
    return formatDate(value, date.format ?? null);
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

function formatDate(value: unknown, format: string | null): string {
  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return formatCell(value);
  }

  if (!format) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  const replacements: Record<string, string> = {
    Y: String(date.getFullYear()),
    y: String(date.getFullYear()).slice(-2),
    m: String(date.getMonth() + 1).padStart(2, "0"),
    n: String(date.getMonth() + 1),
    d: String(date.getDate()).padStart(2, "0"),
    j: String(date.getDate()),
    H: String(date.getHours()).padStart(2, "0"),
    G: String(date.getHours()),
    i: String(date.getMinutes()).padStart(2, "0"),
    s: String(date.getSeconds()).padStart(2, "0"),
  };

  return format.replace(/[YymndjHGis]/g, (token) => replacements[token] ?? token);
}

export function resolveLink(column: TableColumn, row: TableRow, value: unknown): string | null {
  const link = (column.props as TextColumnProps | null)?.link;

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
