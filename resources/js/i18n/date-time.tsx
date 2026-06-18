import type { ReactNode } from "react";
import { type FormatOptions, formatDateValue, preciseDateTime } from "../table/format";
import { useLocale } from "./locale";
import { useTimezone } from "./timezone";

export type DateTimeProps = {
  value: unknown;
  dateStyle?: string | null;
  timeStyle?: string | null;
};

export function DateTime({
  value,
  dateStyle = "medium",
  timeStyle = "short",
}: DateTimeProps): ReactNode {
  const { locale } = useLocale();
  const { timezone } = useTimezone();

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const options: FormatOptions = { locale, timeZone: timezone };
  const text = formatDateValue(value, { dateStyle, timeStyle }, options);
  const iso = isoOrNull(value);
  const title = preciseDateTime(value, options);

  return (
    <time dateTime={iso ?? undefined} title={title || undefined}>
      {text}
    </time>
  );
}

function isoOrNull(value: unknown): string | null {
  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
