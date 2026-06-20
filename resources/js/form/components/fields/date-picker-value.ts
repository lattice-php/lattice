import {
  DateFormatter,
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
const dateTimeFormatOptions = {
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  month: "2-digit",
  year: "numeric",
} as const;
const dateFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
} as const;

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

export function parseDateDisplayValue(value: unknown, locale: string): DateValue | undefined {
  return parseDateValue(value) ?? parseLocalizedDate(value, locale);
}

export function parseDateTimeDisplayValue(
  value: unknown,
  locale: string,
  timezone: string,
): DateValue | undefined {
  return parseDateTimeValue(value, timezone) ?? parseLocalizedDateTime(value, locale, timezone);
}

export function formatDateValue(value: DateValue | undefined): string {
  return value?.toString().slice(0, 10) ?? "";
}

export function formatDateDisplayValue(value: DateValue | undefined, locale: string): string {
  if (!value) {
    return "";
  }

  return new DateFormatter(locale, { ...dateFormatOptions, timeZone: "UTC" }).format(
    value.toDate("UTC"),
  );
}

export function formatDateTimeValue(value: DateValue | undefined, timezone: string): string {
  if (!value) {
    return "";
  }

  const zoned = "timeZone" in value ? toTimeZone(value, timezone) : toZoned(value, timezone);
  const text = zoned.toString().replace(/\[.+\]$/, "");

  return `${normalizeSeconds(text).slice(0, 19)} ${timezone}`;
}

export function formatDateTimeDisplayValue(
  value: DateValue | undefined,
  locale: string,
  timezone: string,
): string {
  if (!value) {
    return "";
  }

  const zoned = "timeZone" in value ? toTimeZone(value, timezone) : toZoned(value, timezone);

  return new DateFormatter(locale, { ...dateTimeFormatOptions, timeZone: timezone }).format(
    zoned.toDate(),
  );
}

export function formatTimeInputValue(value: DateValue | undefined, timezone: string): string {
  if (!value) {
    return "";
  }

  const zoned = "timeZone" in value ? toTimeZone(value, timezone) : toZoned(value, timezone);

  return [
    String(zoned.hour).padStart(2, "0"),
    String(zoned.minute).padStart(2, "0"),
    String(zoned.second).padStart(2, "0"),
  ].join(":");
}

function normalizeSeconds(value: string): string {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? `${value}:00` : value;
}

function parseLocalizedDate(value: unknown, locale: string): DateValue | undefined {
  const parts = localizedParts(value, locale, "date");

  if (!parts) {
    return undefined;
  }

  try {
    return parseDate(
      `${parts.year.padStart(4, "0")}-${parts.month.padStart(2, "0")}-${parts.day.padStart(2, "0")}`,
    );
  } catch {
    return undefined;
  }
}

function parseLocalizedDateTime(
  value: unknown,
  locale: string,
  timezone: string,
): DateValue | undefined {
  const parts = localizedParts(value, locale, "date-time");

  if (!parts || !parts.hour || !parts.minute) {
    return undefined;
  }

  try {
    return toZoned(
      parseDateTime(
        `${parts.year.padStart(4, "0")}-${parts.month.padStart(2, "0")}-${parts.day.padStart(2, "0")}T${parts.hour.padStart(2, "0")}:${parts.minute.padStart(2, "0")}:00`,
      ),
      timezone,
    );
  } catch {
    return undefined;
  }
}

function localizedParts(
  value: unknown,
  locale: string,
  mode: "date" | "date-time",
):
  | {
      day: string;
      hour?: string;
      minute?: string;
      month: string;
      year: string;
    }
  | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const formatter = new DateFormatter(
    locale,
    mode === "date" ? dateFormatOptions : dateTimeFormatOptions,
  );
  const sample = new Date(Date.UTC(2006, 10, 22, 14, 30, 0));
  const pattern = formatter
    .formatToParts(sample)
    .map((part) => {
      if (["day", "hour", "minute", "month", "year"].includes(part.type)) {
        return `(?<${part.type}>\\d{1,4})`;
      }

      return escapeRegExp(part.value).replace(/\s+/g, "\\s*");
    })
    .join("");
  const match = new RegExp(`^\\s*${pattern}\\s*$`).exec(value);
  const groups = match?.groups;

  if (!groups?.day || !groups.month || !groups.year) {
    return undefined;
  }

  return {
    day: groups.day,
    hour: groups.hour,
    minute: groups.minute,
    month: groups.month,
    year: groups.year,
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
