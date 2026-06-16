import type { ColumnCellComponent } from "../../registry";
import type { ColumnPropsOf } from "../../types";
import { TextCell } from "./text-cell";

/** Renders a stack column's nested columns as stacked text rows. */
export const StackCell: ColumnCellComponent<"column.stack"> = ({ column, row }) => (
  <div className="grid gap-1">
    {(column.columns ?? []).map((stackedColumn) => (
      <span key={stackedColumn.key}>
        <TextCell
          column={stackedColumn}
          props={(stackedColumn.props ?? {}) as ColumnPropsOf<"column.text">}
          row={row}
          value={row[stackedColumn.key]}
        />
      </span>
    ))}
  </div>
);
