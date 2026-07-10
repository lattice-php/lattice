import { Icon } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { HTMLAttributes } from "react";
import { alignJustify, alignText } from "@lattice-php/lattice/table/lib/align";
import { getColumnAriaSort, getColumnSort } from "@lattice-php/lattice/table/lib/query";
import type { TableColumn, TableSort, TableState } from "@lattice-php/lattice/table/types";

function SortIndicator({ sort }: { sort: TableSort | undefined }) {
  if (sort?.direction === "asc") {
    return <Icon name="arrow-up" aria-hidden="true" className="size-lt-icon-sm shrink-0" />;
  }

  if (sort?.direction === "desc") {
    return <Icon name="arrow-down" aria-hidden="true" className="size-lt-icon-sm shrink-0" />;
  }

  return (
    <Icon
      name="chevrons-up-down"
      aria-hidden="true"
      className="size-lt-icon-sm shrink-0 opacity-50"
    />
  );
}

export function ColumnHeader({
  column,
  processing,
  resizeHandleProps,
  sort,
  state,
}: {
  column: TableColumn;
  processing: boolean;
  resizeHandleProps?: HTMLAttributes<HTMLDivElement>;
  sort: (column: TableColumn) => void;
  state: TableState;
}) {
  const columnSort = getColumnSort(state, column);
  const { align, label, sortable } = column.props;

  return (
    <div
      aria-sort={getColumnAriaSort(columnSort)}
      className={cn(
        "relative min-w-0 px-4 py-3 pr-5 align-middle font-semibold text-lt-fg",
        alignText(align),
      )}
      role="columnheader"
    >
      {sortable ? (
        <button
          type="button"
          aria-label={`Sort ${label}`}
          className={cn("flex w-full items-center gap-1.5 font-semibold", alignJustify(align))}
          data-test={`sort-${column.key}`}
          disabled={processing}
          onClick={() => sort(column)}
        >
          <span className={cn("min-w-0 flex-1 truncate", alignText(align))}>{label}</span>
          <SortIndicator sort={columnSort} />
        </button>
      ) : (
        <span className={cn("block truncate", alignText(align))}>{label}</span>
      )}
      {resizeHandleProps && <div {...resizeHandleProps} />}
    </div>
  );
}
