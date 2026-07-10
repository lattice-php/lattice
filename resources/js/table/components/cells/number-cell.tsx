import { useLocale } from "@lattice-php/lattice/i18n";
import { formatNumber } from "@lattice-php/lattice/format/number";
import { numericValue } from "@lattice-php/lattice/format/numeric";
import { formatCell } from "@lattice-php/lattice/table/lib/format";
import type { ColumnCellComponent } from "@lattice-php/lattice/table/registry";

export const NumberCell: ColumnCellComponent<"column.number"> = ({ column, props, value }) => {
  const { locale } = useLocale();

  if (numericValue(value) === null) {
    return <span>{formatCell(value, column)}</span>;
  }

  const text = formatNumber(
    value,
    {
      kind: "number",
      notation: props.compact ? "compact" : "standard",
      minimumFractionDigits: props.minimumFractionDigits,
      maximumFractionDigits: props.maximumFractionDigits,
      currency: null,
      unit: props.unit,
    },
    locale,
  );

  return <span className="tabular-nums">{text}</span>;
};
