import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { getColumnAriaSort, getColumnSort } from "../query";
import type { TableColumn, TableSort, TableState } from "../types";
import { ColumnFilter } from "./column-filter";

function SortIndicator({ sort }: { sort: TableSort | undefined }) {
  if (sort?.direction === "asc") {
    return <ArrowUp aria-hidden="true" className="size-3.5" />;
  }

  if (sort?.direction === "desc") {
    return <ArrowDown aria-hidden="true" className="size-3.5" />;
  }

  return <ChevronsUpDown aria-hidden="true" className="size-3.5 opacity-50" />;
}

export function ColumnHeader({
  column,
  processing,
  sort,
  state,
  filterValue,
  onFilterChange,
  onFilterApply,
}: {
  column: TableColumn;
  processing: boolean;
  sort: (column: TableColumn) => void;
  state: TableState;
  filterValue: string;
  onFilterChange: (value: string) => void;
  onFilterApply: (value: string) => void;
}) {
  const columnSort = getColumnSort(state, column);

  return (
    <div
      aria-sort={getColumnAriaSort(columnSort)}
      className="grid gap-2 px-4 py-3 text-left align-middle font-medium text-lt-muted-fg"
      role="columnheader"
    >
      {column.sortable ? (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 font-medium"
          disabled={processing}
          onClick={() => sort(column)}
        >
          {`Sort ${column.label}`}
          <SortIndicator sort={columnSort} />
        </button>
      ) : (
        <span>{column.label}</span>
      )}

      {column.filter?.enabled && (
        <ColumnFilter
          column={column}
          value={filterValue}
          processing={processing}
          onChange={onFilterChange}
          onApply={onFilterApply}
        />
      )}
    </div>
  );
}
