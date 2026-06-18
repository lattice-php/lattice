import type { ReactNode } from "react";
import { type FormatOptions, formatCell, preciseDateTime } from "../table/format";
import { useLocale } from "./locale";
import { useTimezone } from "./timezone";

export type DateTimeProps = {
  value: unknown;
  format?: string | null;
};

const dateColumn = (format: string | null) =>
  ({ key: "", label: "", props: { date: { format } } }) as never;

export function DateTime({ value, format = null }: DateTimeProps): ReactNode {
  const { locale } = useLocale();
  const { timezone } = useTimezone();

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const options: FormatOptions = { locale, timeZone: timezone };
  const text = formatCell(value, dateColumn(format), options);
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
