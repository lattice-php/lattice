import type { HTMLAttributes } from "react";
import {
  DataTableHeaderCell,
  DataTableHeaderLabel,
  DataTableSortButton,
  type DataTablePinBoundary,
} from "@lattice-php/table/primitives/data-table";
import { useT } from "@lattice-php/ui/i18n";
import { getColumnSort } from "@lattice-php/table/lib/query";
import type { TableColumn, TableQuery } from "@lattice-php/table/types";
import type { Side } from "@lattice-php/ui";

export function ColumnHeader({
  bottomBordered,
  column,
  pinBoundary,
  pinIndex,
  pinned,
  processing,
  resizeHandleProps,
  sort,
  query,
}: {
  bottomBordered?: boolean;
  column: TableColumn;
  pinBoundary?: DataTablePinBoundary;
  pinIndex?: number;
  pinned?: Side;
  processing: boolean;
  resizeHandleProps?: HTMLAttributes<HTMLDivElement>;
  sort: (column: TableColumn) => void;
  query: TableQuery;
}) {
  const columnSort = getColumnSort(query, column);
  const { t } = useT("lattice");
  const { align, label, sortable } = column.props;

  return (
    <DataTableHeaderCell
      align={align}
      bottomBordered={bottomBordered}
      pinBoundary={pinBoundary}
      pinIndex={pinIndex}
      pinned={pinned}
      sortDirection={columnSort?.direction}
    >
      {sortable ? (
        <DataTableSortButton
          align={align}
          aria-label={t("table.sort.column", "Sort {{label}}", { label })}
          data-test={`sort-${column.key}`}
          direction={columnSort?.direction}
          disabled={processing}
          onClick={() => sort(column)}
        >
          {label}
        </DataTableSortButton>
      ) : (
        <DataTableHeaderLabel align={align}>{label}</DataTableHeaderLabel>
      )}
      {resizeHandleProps && <div {...resizeHandleProps} />}
    </DataTableHeaderCell>
  );
}
