import { Icon } from "@lattice-php/lattice/icons";
import { IconButton } from "@lattice-php/lattice/ui/icon-button";
import { getSortDirectionLabel } from "@lattice-php/lattice/table/lib/query";
import type { TableColumn, TableSort, TableQuery } from "@lattice-php/lattice/table/types";

export function SortBar({
  columnsByKey,
  query,
  processing,
  onClear,
}: {
  columnsByKey: Map<string, TableColumn>;
  query: TableQuery;
  processing: boolean;
  onClear: (sort: TableSort) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-lt-border px-4 py-2.5 text-sm">
      {query.sorts.map((sort, index) => {
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
            <IconButton
              size="xs"
              icon="x"
              label={`Clear ${label} sort`}
              data-test={`clear-${sort.key}-sort`}
              disabled={processing}
              onClick={() => onClear(sort)}
            />
          </span>
        );
      })}
    </div>
  );
}
