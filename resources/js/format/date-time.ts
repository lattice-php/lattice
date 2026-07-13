import type { DateTimeStyle } from "@lattice-php/lattice/types/generated";

export type FormatOptions = {
  locale?: string;
  timeZone?: string;
};

export type DateConfig = {
  dateStyle: DateTimeStyle | null;
  timeStyle: DateTimeStyle | null;
  month?: string | null;
  year?: string | null;
};

export function formatDateValue(value: unknown, date: DateConfig, options?: FormatOptions): string {
  const parsed = new Date(String(value));

  if (Number.isNaN(parsed.getTime())) {
    return String(value ?? "");
  }

  const intl: Intl.DateTimeFormatOptions = { timeZone: options?.timeZone };

  if (date.dateStyle) {
    intl.dateStyle = date.dateStyle;
  }

  if (date.timeStyle) {
    intl.timeStyle = date.timeStyle;
  }

  if (date.month) {
    intl.month = date.month as Intl.DateTimeFormatOptions["month"];
  }

  if (date.year) {
    intl.year = date.year as Intl.DateTimeFormatOptions["year"];
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
