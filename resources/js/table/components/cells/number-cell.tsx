import { useLocale } from "@lattice-php/lattice/i18n";
import { formatCell } from "../../format";
import type { ColumnCellComponent } from "../../registry";
import { numericValue } from "./numeric";

export const NumberCell: ColumnCellComponent<"number"> = ({ column, props, value }) => {
  const { locale } = useLocale();
  const number = numericValue(value);

  if (number === null) {
    return <span>{formatCell(value, column)}</span>;
  }

  const text = new Intl.NumberFormat(locale, {
    minimumFractionDigits: props.minimumFractionDigits ?? undefined,
    maximumFractionDigits: props.maximumFractionDigits ?? undefined,
    ...(props.unit ? { style: "unit" as const, unit: props.unit } : {}),
  }).format(number);

  return <span className="tabular-nums">{text}</span>;
};
