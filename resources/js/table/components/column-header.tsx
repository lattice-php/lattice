import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { getColumnAriaSort, getColumnSort } from "../query";
import type { TableColumn, TableSort, TableState } from "../types";

function SortIndicator({ sort }: { sort: TableSort | undefined }) {
  if (sort?.direction === "asc") {
    return <ArrowUp aria-hidden="true" className="size-3.5 shrink-0" />;
  }

  if (sort?.direction === "desc") {
    return <ArrowDown aria-hidden="true" className="size-3.5 shrink-0" />;
  }

  return <ChevronsUpDown aria-hidden="true" className="size-3.5 shrink-0 opacity-50" />;
}

export function ColumnHeader({
  column,
  processing,
  sort,
  state,
}: {
  column: TableColumn;
  processing: boolean;
  sort: (column: TableColumn) => void;
  state: TableState;
}) {
  const columnSort = getColumnSort(state, column);

  return (
    <div
      aria-sort={getColumnAriaSort(columnSort)}
      className="min-w-0 px-4 py-3 text-left align-middle font-medium text-lt-muted-fg"
      role="columnheader"
    >
      {column.sortable ? (
        <button
          type="button"
          aria-label={`Sort ${column.label}`}
          className="flex w-full items-center gap-1.5 font-medium"
          disabled={processing}
          onClick={() => sort(column)}
        >
          <span className="min-w-0 flex-1 truncate text-left">{column.label}</span>
          <SortIndicator sort={columnSort} />
        </button>
      ) : (
        <span className="block truncate">{column.label}</span>
      )}
    </div>
  );
}
