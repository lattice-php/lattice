import { useColumnRegistry } from "../../provider";
import type { TableColumn, TableRow } from "../types";
import { BadgeCell } from "./cells/badge-cell";
import { IconCell } from "./cells/icon-cell";
import { ImageCell } from "./cells/image-cell";
import { TextCell } from "./cells/text-cell";

export function ColumnCell({ column, row }: { column: TableColumn; row: TableRow }) {
  const columnRegistry = useColumnRegistry();
  const customRenderer = columnRegistry[column.type];

  if (customRenderer) {
    return customRenderer({ column, row, value: row[column.key] });
  }

  if (column.type === "stack") {
    return (
      <div className="grid gap-1">
        {(column.columns ?? []).map((stackedColumn) => (
          <span key={stackedColumn.key}>
            <TextCell column={stackedColumn} row={row} value={row[stackedColumn.key]} />
          </span>
        ))}
      </div>
    );
  }

  if (column.type === "badge") {
    return <BadgeCell column={column} value={row[column.key]} />;
  }

  if (column.type === "icon") {
    return <IconCell column={column} value={row[column.key]} />;
  }

  if (column.type === "image") {
    return <ImageCell column={column} value={row[column.key]} />;
  }

  return <TextCell column={column} row={row} value={row[column.key]} />;
}
