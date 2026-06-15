import { formatCell } from "../../format";
import type { ColumnCellComponent } from "../../registry";

/** Renders a numeric column right-aligned, formatting numbers for the locale. */
export const NumberCell: ColumnCellComponent<"number"> = ({ column, value }) => {
  const number = typeof value === "number" ? value : Number(value);
  const text =
    value !== null && value !== undefined && value !== "" && !Number.isNaN(number)
      ? new Intl.NumberFormat().format(number)
      : formatCell(value, column);

  return <span className="block text-right tabular-nums">{text}</span>;
};
