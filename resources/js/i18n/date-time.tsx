import type { ReactNode } from "react";
import {
  type FormatOptions,
  formatDateValue,
  preciseDateTime,
  toDate,
} from "@lattice-php/lattice/format/date-time";
import type { DateTimeStyle } from "@lattice-php/lattice/types/generated";
import { useLocale } from "./locale";
import { useTimezone } from "./timezone";

export type DateTimeProps = {
  value: unknown;
  dateStyle?: DateTimeStyle | null;
  timeStyle?: DateTimeStyle | null;
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
  return toDate(value)?.toISOString() ?? null;
}
