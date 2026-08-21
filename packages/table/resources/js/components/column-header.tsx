import { Icon } from "@lattice-php/ui/icons";
import { cn } from "@lattice-php/ui/lib/utils";
import type { CSSProperties, HTMLAttributes } from "react";
import { alignJustify, alignText } from "@lattice-php/table/lib/align";
import { useT } from "@lattice-php/ui/i18n";
import type { PinBoundary } from "@lattice-php/table/lib/pin-boundary";
import { pinBoundaryClassName } from "@lattice-php/table/lib/pin-boundary";
import { getColumnAriaSort, getColumnSort } from "@lattice-php/table/lib/query";
import type { TableColumn, TableSort, TableQuery } from "@lattice-php/table/types";

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
  bottomBordered,
  column,
  pinBoundary,
  pinned,
  pinStyle,
  processing,
  resizeHandleProps,
  sort,
  query,
}: {
  bottomBordered?: boolean;
  column: TableColumn;
  pinBoundary?: PinBoundary;
  pinned?: "left" | "right";
  pinStyle?: CSSProperties;
  processing: boolean;
  resizeHandleProps?: HTMLAttributes<HTMLDivElement>;
  sort: (column: TableColumn) => void;
  query: TableQuery;
}) {
  const columnSort = getColumnSort(query, column);
  const { t } = useT("lattice");
  const { align, label, sortable } = column.props;

  return (
    <div
      aria-sort={getColumnAriaSort(columnSort)}
      className={cn(
        "relative min-w-0 px-4 py-3 pr-5 align-middle font-semibold text-lt-fg",
        pinned ? "bg-[var(--lt-table-pinned-muted-bg)]" : "bg-lt-muted/50",
        pinned && "md:sticky z-[1]",
        bottomBordered && "border-b border-lt-border",
        pinBoundaryClassName(pinBoundary),
        alignText(align),
      )}
      data-pin-boundary={pinBoundary}
      data-pinned={pinned}
      role="columnheader"
      style={pinStyle}
    >
      {sortable ? (
        <button
          type="button"
          aria-label={t("table.sort.column", "Sort {{label}}", { label })}
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
