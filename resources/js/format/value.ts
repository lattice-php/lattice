import type { DateFormat, NumberFormat } from "@lattice-php/lattice/types/generated";
import { formatDateValue } from "./date-time";
import { formatNumber } from "./number";

export type Format = NumberFormat | DateFormat;

function isDateFormat(format: Format): format is DateFormat {
  return format.kind === "date";
}

export function formatValue(
  value: unknown,
  format: Format | null,
  ctx: { locale: string; timezone: string },
): string {
  if (format === null) {
    return String(value ?? "");
  }

  return isDateFormat(format)
    ? formatDateValue(value, format, { locale: ctx.locale, timeZone: ctx.timezone })
    : formatNumber(value, format, ctx.locale);
}
