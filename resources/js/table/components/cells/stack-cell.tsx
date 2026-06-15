import type { TextColumnProps } from "@lattice-php/lattice/types/generated";
import type { ColumnCellComponent } from "../../registry";
import { TextCell } from "./text-cell";

/** Renders a stack column's nested columns as stacked text rows. */
export const StackCell: ColumnCellComponent<"stack"> = ({ column, row }) => (
  <div className="grid gap-1">
    {(column.columns ?? []).map((stackedColumn) => (
      <span key={stackedColumn.key}>
        <TextCell
          column={stackedColumn}
          props={(stackedColumn.props ?? {}) as TextColumnProps}
          row={row}
          value={row[stackedColumn.key]}
        />
      </span>
    ))}
  </div>
);
