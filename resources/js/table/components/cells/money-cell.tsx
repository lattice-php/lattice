import { useLocale } from "@lattice-php/lattice/i18n";
import { formatCell } from "../../format";
import type { ColumnCellComponent } from "../../registry";

export const MoneyCell: ColumnCellComponent<"money"> = ({ column, props, row, value }) => {
  const { locale } = useLocale();
  const number = typeof value === "number" ? value : Number(value);
  const isNumeric = value !== null && value !== undefined && value !== "" && !Number.isNaN(number);

  if (!isNumeric) {
    return <span>{formatCell(value, column)}</span>;
  }

  const code =
    props.currency ?? (props.currencyField ? String(row[props.currencyField] ?? "") : "");
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
