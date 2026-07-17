import type { ColumnCellComponent } from "@lattice-php/lattice/table/registry";
import { NumericCell } from "./numeric-cell";

export const MoneyCell: ColumnCellComponent<"column.money"> = ({ column, props, row, value }) => {
  const rawCode = props.currencyField ? row[props.currencyField] : undefined;
  const code = props.currency ?? (typeof rawCode === "string" ? rawCode : null);

  return (
    <NumericCell
      column={column}
      copyable={props.copyable}
      value={value}
      format={{
        kind: "number",
        notation: "standard",
        minimumFractionDigits: props.minimumFractionDigits,
        maximumFractionDigits: props.maximumFractionDigits,
        currency: code,
        unit: null,
      }}
    />
  );
};
