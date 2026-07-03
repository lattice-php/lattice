import type { NumberFormat } from "@lattice-php/lattice/types";
import { numericValue } from "./numeric";

export function formatNumber(value: unknown, format: NumberFormat, locale: string): string {
  const number = numericValue(value);

  if (number === null) {
    return String(value ?? "");
  }

  const options: Intl.NumberFormatOptions = {
    notation: format.notation as Intl.NumberFormatOptions["notation"],
    minimumFractionDigits: format.minimumFractionDigits ?? undefined,
    maximumFractionDigits: format.maximumFractionDigits ?? undefined,
  };

  if (format.currency) {
    options.style = "currency";
    options.currency = format.currency;
  } else if (format.unit) {
    options.style = "unit";
    options.unit = format.unit;
  }

  return new Intl.NumberFormat(locale, options).format(number);
}
