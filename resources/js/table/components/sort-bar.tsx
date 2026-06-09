import { ArrowDown, ArrowUp, X } from "lucide-react";
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
    <div className="flex flex-wrap items-center gap-4 border-b border-lt-border px-4 py-2.5 text-sm">
      {state.sorts.map((sort, index) => {
        const column = getSortColumn(columns, sort);
        const label = column?.label ?? sort.key;
        const Chevron = sort.direction === "desc" ? ArrowDown : ArrowUp;

        return (
          <span key={sort.key} className="inline-flex items-center gap-1.5">
            <span className="font-medium">{`${index + 1}. ${label}`}</span>
            <Chevron
              role="img"
              aria-label={getSortDirectionLabel(sort.direction)}
              className="size-3.5 text-lt-muted-fg"
            />
            <button
              type="button"
              className="inline-flex size-5 items-center justify-center rounded text-lt-muted-fg hover:bg-lt-muted disabled:opacity-50"
              disabled={processing}
              aria-label={`Clear ${label} sort`}
              data-test={`clear-${sort.key}-sort`}
              onClick={() => onClear(sort)}
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
