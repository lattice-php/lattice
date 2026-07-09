import { useLocale } from "@lattice-php/lattice/i18n";
import { formatNumber } from "../../../format/number";
import { numericValue } from "../../../format/numeric";
import { formatCell } from "../../lib/format";
import type { ColumnCellComponent } from "../../registry";

export const MoneyCell: ColumnCellComponent<"column.money"> = ({ column, props, row, value }) => {
  const { locale } = useLocale();

  if (numericValue(value) === null) {
    return <span>{formatCell(value, column)}</span>;
  }

  const rawCode = props.currencyField ? row[props.currencyField] : undefined;
  const code = props.currency ?? (typeof rawCode === "string" ? rawCode : null);

  const text = formatNumber(
    value,
    {
      kind: "number",
      notation: "standard",
      minimumFractionDigits: props.minimumFractionDigits,
      maximumFractionDigits: props.maximumFractionDigits,
      currency: code,
      unit: null,
    },
    locale,
  );

  return <span className="tabular-nums">{text}</span>;
};
