import { Icon } from "@lattice-php/lattice/icons";
import { getSortDirectionLabel } from "@lattice-php/lattice/table/lib/query";
import type { TableColumn, TableSort, TableState } from "@lattice-php/lattice/table/types";

export function SortBar({
  columnsByKey,
  state,
  processing,
  onClear,
}: {
  columnsByKey: Map<string, TableColumn>;
  state: TableState;
  processing: boolean;
  onClear: (sort: TableSort) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-lt-border px-4 py-2.5 text-sm">
      {state.sorts.map((sort, index) => {
        const column = columnsByKey.get(sort.key);
        const label = column?.props.label ?? sort.key;
        const arrow = sort.direction === "desc" ? "arrow-down" : "arrow-up";

        return (
          <span key={sort.key} className="inline-flex items-center gap-1.5">
            <span className="font-medium">{`${index + 1}. ${label}`}</span>
            <Icon
              name={arrow}
              role="img"
              aria-hidden={false}
              aria-label={getSortDirectionLabel(sort.direction)}
              className="size-lt-icon-sm text-lt-muted-fg"
            />
            <button
              type="button"
              className="inline-flex size-5 items-center justify-center rounded-lt-sm text-lt-muted-fg hover:bg-lt-muted disabled:opacity-50"
              disabled={processing}
              aria-label={`Clear ${label} sort`}
              data-test={`clear-${sort.key}-sort`}
              onClick={() => onClear(sort)}
            >
              <Icon name="x" className="size-lt-icon-sm" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
