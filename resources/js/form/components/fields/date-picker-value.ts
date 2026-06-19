import {
  type DateValue,
  parseAbsolute,
  parseDate,
  parseDateTime,
  parseZonedDateTime,
  toTimeZone,
  toZoned,
} from "@internationalized/date";

const dateTimeWithZone = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?)\s+(.+)$/;
const bareDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/;

export function parseDateValue(value: unknown): DateValue | undefined {
  if (typeof value !== "string" || value === "") {
    return undefined;
  }

  try {
    return parseDate(value.slice(0, 10));
  } catch {
    return undefined;
  }
}

export function parseDateTimeValue(value: unknown, timezone: string): DateValue | undefined {
  if (typeof value !== "string" || value === "") {
    return undefined;
  }

  const zoned = dateTimeWithZone.exec(value);

  try {
    if (zoned) {
      return parseZonedDateTime(`${normalizeSeconds(zoned[1])}[${zoned[2]}]`);
    }

    if (bareDateTime.test(value)) {
      return toZoned(parseDateTime(normalizeSeconds(value)), timezone);
    }

    return parseAbsolute(value, timezone);
  } catch {
    return undefined;
  }
}

export function formatDateValue(value: DateValue | undefined): string {
  return value?.toString().slice(0, 10) ?? "";
}

export function formatDateTimeValue(value: DateValue | undefined, timezone: string): string {
  if (!value) {
    return "";
  }

  const zoned = "timeZone" in value ? toTimeZone(value, timezone) : toZoned(value, timezone);
  const text = zoned.toString().replace(/\[.+\]$/, "");

  return `${normalizeSeconds(text).slice(0, 19)} ${timezone}`;
}

function normalizeSeconds(value: string): string {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? `${value}:00` : value;
}
