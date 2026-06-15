import { useLocale } from "@lattice-php/lattice/i18n";
import { formatCell } from "../../format";
import type { ColumnCellComponent } from "../../registry";
import { numericValue } from "./numeric";

export const MoneyCell: ColumnCellComponent<"money"> = ({ column, props, row, value }) => {
  const { locale } = useLocale();
  const number = numericValue(value);

  if (number === null) {
    return <span>{formatCell(value, column)}</span>;
  }

  const rawCode = props.currencyField ? row[props.currencyField] : undefined;
  const code = props.currency ?? (typeof rawCode === "string" ? rawCode : "");
  const fractionDigits = {
    minimumFractionDigits: props.minimumFractionDigits ?? undefined,
    maximumFractionDigits: props.maximumFractionDigits ?? undefined,
  };

  const text = code
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: code,
        ...fractionDigits,
      }).format(number)
    : new Intl.NumberFormat(locale, fractionDigits).format(number);

  return <span className="tabular-nums">{text}</span>;
};
