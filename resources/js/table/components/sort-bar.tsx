import { X } from "lucide-react";
import { getSortColumn, getSortDirectionLabel } from "../query";
import type { TableColumn, TableSort, TableState } from "../types";

export function SortBar({
  columns,
  state,
  processing,
  onClear,
}: {
  columns: TableColumn[];
  state: TableState;
  processing: boolean;
  onClear: (sort: TableSort) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-lt-border px-4 py-3 text-sm">
      <span className="font-medium text-lt-muted-fg">Sorted by</span>
      {state.sorts.map((sort, index) => {
        const column = getSortColumn(columns, sort);
        const label = column?.label ?? sort.key;
        const directionLabel = getSortDirectionLabel(sort.direction);

        return (
          <span
            key={sort.key}
            className="inline-flex items-center gap-1.5 rounded-lt-sm border border-lt-border bg-lt-bg px-2 py-1"
          >
            <span>{`${index + 1}. ${label} ${directionLabel}`}</span>
            <button
              type="button"
              className="inline-flex size-5 items-center justify-center rounded hover:bg-lt-muted disabled:opacity-50"
              disabled={processing}
              aria-label={`Clear ${label} sort`}
              data-test={`clear-${sort.key}-sort`}
              onClick={() => onClear(sort)}
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
