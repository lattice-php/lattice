import type { ColumnPropsOf, TableColumn, TableRow } from "./types";

export type FormatOptions = {
  locale?: string;
  timeZone?: string;
};

export type DateConfig = { dateStyle: string | null; timeStyle: string | null };

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

export function formatDateValue(value: unknown, date: DateConfig, options?: FormatOptions): string {
  const parsed = new Date(String(value));

  if (Number.isNaN(parsed.getTime())) {
    return String(value ?? "");
  }

  const intl: Intl.DateTimeFormatOptions = { timeZone: options?.timeZone };

  if (date.dateStyle) {
    intl.dateStyle = date.dateStyle as Intl.DateTimeFormatOptions["dateStyle"];
  }

  if (date.timeStyle) {
    intl.timeStyle = date.timeStyle as Intl.DateTimeFormatOptions["timeStyle"];
  }

  return new Intl.DateTimeFormat(options?.locale, intl).format(parsed);
}

export function preciseDateTime(value: unknown, options?: FormatOptions): string {
  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatted = new Intl.DateTimeFormat(options?.locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: options?.timeZone,
    timeZoneName: "short",
  }).format(date);

  return options?.timeZone ? `${formatted} (${options.timeZone})` : formatted;
}

export function resolveLink(column: TableColumn, row: TableRow, value: unknown): string | null {
  const link = (column.props as ColumnPropsOf<"column.text"> | null)?.link;

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
