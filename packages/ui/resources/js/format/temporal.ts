import { parseDate, today } from "@internationalized/date";
import type { DateTimeStyle } from "../types";

export type { DateValue } from "@internationalized/date";
export {
  CalendarDate,
  DateFormatter,
  parseAbsolute,
  parseDate,
  parseDateTime,
  parseZonedDateTime,
  startOfWeek,
  Time,
  today,
  toTimeZone,
  toZoned,
  ZonedDateTime,
} from "@internationalized/date";

const DAY_MS = 24 * 60 * 60 * 1000;

export function addDays(dateISO: string, days: number): string {
  return parseDate(dateISO).add({ days }).toString();
}

export function daysBetween(startISO: string, dateISO: string): number {
  // compare() documents only its sign, so day counts diff UTC-midnight epochs instead.
  const start = parseDate(startISO).toDate("UTC").getTime();
  const target = parseDate(dateISO).toDate("UTC").getTime();

  return Math.round((target - start) / DAY_MS);
}

/**
 * ISO 8601 week number (Monday-start weeks, week 1 contains the year's first
 * Thursday). Hand-rolled because the library exposes no ISO week numbers; the
 * math runs at UTC noon so a DST transition in the reader's local timezone can
 * never shift a day index.
 */
export function isoWeek(dateISO: string): number {
  const date = new Date(`${dateISO}T12:00:00Z`);
  const dayOfWeek = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayOfWeek + 3);

  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstThursdayOffset = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayOffset + 3);

  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * DAY_MS));
}

/** Today's calendar date in `timeZone`, as `Y-m-d`. */
export function todayISO(timeZone: string): string {
  return today(timeZone).toString();
}

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
  const parsed = toDate(value);

  if (!parsed) {
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

export function toDate(value: unknown): Date | null {
  const date =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;

  return date && !Number.isNaN(date.getTime()) ? date : null;
}

export function preciseDateTime(value: unknown, options?: FormatOptions): string {
  const date = toDate(value);

  if (!date) {
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
