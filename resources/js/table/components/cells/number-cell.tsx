import type { ColumnCellComponent } from "@lattice-php/lattice/table/registry";
import { NumericCell } from "./numeric-cell";

export const NumberCell: ColumnCellComponent<"column.number"> = ({ column, props, value }) => (
  <NumericCell
    column={column}
    copyable={props.copyable}
    value={value}
    format={{
      kind: "number",
      notation: props.compact ? "compact" : "standard",
      minimumFractionDigits: props.minimumFractionDigits,
      maximumFractionDigits: props.maximumFractionDigits,
      currency: null,
      unit: props.unit,
    }}
  />
);
