import { useLocale } from "@lattice-php/lattice/i18n";
import { formatCell } from "../../format";
import type { ColumnCellComponent } from "../../registry";

export const NumberCell: ColumnCellComponent<"number"> = ({ column, props, value }) => {
  const { locale } = useLocale();
  const number = typeof value === "number" ? value : Number(value);
  const isNumeric = value !== null && value !== undefined && value !== "" && !Number.isNaN(number);

  if (!isNumeric) {
    return <span>{formatCell(value, column)}</span>;
  }

  const text = new Intl.NumberFormat(locale, {
    minimumFractionDigits: props.minimumFractionDigits ?? undefined,
    maximumFractionDigits: props.maximumFractionDigits ?? undefined,
    ...(props.unit ? { style: "unit" as const, unit: props.unit } : {}),
  }).format(number);

  return <span className="tabular-nums">{text}</span>;
};
