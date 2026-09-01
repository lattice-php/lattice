import {
  Children,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  createContext,
  useContext,
} from "react";
import { Button } from "@lattice-php/ui/components/button/button";
import { Icon } from "@lattice-php/ui/icons";
import { cn } from "@lattice-php/ui/lib/utils";
import { IconButton } from "@lattice-php/ui/primitives/icon-button";
import { Input } from "@lattice-php/form/primitives/input";
import type { ColumnAlign, ColumnPin, SortDirection } from "../generated";

export type DataTablePinBoundary = "start" | "end";
export type DataTableTrack = "column" | "expander" | "selection" | "actions" | "filler";

const alignText: Record<ColumnAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

const alignJustify: Record<ColumnAlign, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

const alignJustifyItems: Record<ColumnAlign, string> = {
  start: "justify-items-start",
  center: "justify-items-center",
  end: "justify-items-end",
};

export const DATA_TABLE_EXPANDER_TRACK = "2.5rem";
export const DATA_TABLE_SELECTION_TRACK = "3rem";
export const DATA_TABLE_ACTIONS_TRACK = "10rem";

/**
 * Utility tracks are fixed widths because the independent header, filter, and
 * body grids would drift apart with content-sized tracks.
 */
export function dataTableUtilityTracks({
  actions = false,
  expander = false,
  selection = false,
}: {
  actions?: boolean;
  expander?: boolean;
  selection?: boolean;
}): { leadingTracks: string[]; trailingTracks: string[] } {
  return {
    leadingTracks: [
      ...(expander ? [DATA_TABLE_EXPANDER_TRACK] : []),
      ...(selection ? [DATA_TABLE_SELECTION_TRACK] : []),
    ],
    trailingTracks: actions ? [DATA_TABLE_ACTIONS_TRACK] : [],
  };
}

export function pinBoundaryClassName(
  boundary: DataTablePinBoundary | undefined,
): string | undefined {
  if (boundary === "end") {
    return "md:border-e md:border-lt-border";
  }

  if (boundary === "start") {
    return "md:border-s md:border-lt-border";
  }

  return undefined;
}

type PinProps = {
  pinBoundary?: DataTablePinBoundary;
  pinIndex?: number;
  pinned?: ColumnPin;
};

function pinOffsetStyle(
  kind: DataTableTrack,
  { pinIndex, pinned }: PinProps,
): CSSProperties | undefined {
  if (!pinned || kind === "filler") {
    return undefined;
  }

  const track = kind === "column" ? pinIndex : kind;
  const offset = `var(--lt-pin-offset-${track})`;

  return pinned === "left" ? { insetInlineStart: offset } : { insetInlineEnd: offset };
}

function pinClassName(kind: DataTableTrack, { pinBoundary, pinned }: PinProps): string | undefined {
  if (kind === "filler") {
    return undefined;
  }

  return cn(pinned && "md:sticky z-[1]", pinBoundaryClassName(pinBoundary));
}

function pinnedHeaderBackground(pinned: boolean): string {
  return pinned ? "bg-[var(--lt-table-pinned-muted-bg)]" : "bg-lt-muted/50";
}

function pinnedBodyBackground(
  pinned: boolean,
  striped: boolean,
  clickable: boolean,
): string | undefined {
  if (!pinned) {
    return undefined;
  }

  return cn(
    "bg-[var(--lt-table-pinned-bg)]",
    striped && "group-odd/row:bg-[var(--lt-table-pinned-stripe-bg)]",
    clickable && "group-hover/row:bg-[var(--lt-table-pinned-hover-bg)]",
  );
}

export type DataTableProps = ComponentProps<"div">;

export function DataTable({ children, className, ...props }: DataTableProps): ReactNode {
  return (
    <div data-slot="table" {...props} className={cn("relative min-w-0", className)}>
      <div data-slot="table-scroll" className="rounded-lt-sm border border-lt-border">
        {children}
      </div>
    </div>
  );
}

export type DataTableToolbarProps = Omit<ComponentProps<"div">, "children"> & {
  end?: ReactNode;
  start?: ReactNode;
};

export function DataTableToolbar({
  className,
  end,
  start,
  ...props
}: DataTableToolbarProps): ReactNode {
  return (
    <div
      data-slot="table-toolbar"
      {...props}
      className={cn("flex items-center gap-2 border-b border-lt-border px-4 py-2", className)}
    >
      {start}
      <div className="ms-auto flex items-center gap-1">{end}</div>
    </div>
  );
}

export type DataTableSearchProps = Omit<ComponentProps<typeof Input>, "onChange" | "value"> & {
  clearButtonProps?: Omit<ComponentProps<"button">, "children" | "onClick"> & {
    "data-test"?: string;
  };
  clearLabel: string;
  onClear: () => void;
  onValueChange: (value: string) => void;
  value: string;
};

export function DataTableSearch({
  className,
  clearButtonProps,
  clearLabel,
  onClear,
  onValueChange,
  placeholder,
  value,
  ...props
}: DataTableSearchProps): ReactNode {
  return (
    <div className="relative w-full max-w-xs">
      <Icon
        name="search"
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 size-lt-icon-sm -translate-y-1/2 text-lt-muted-fg"
      />
      <Input
        type="search"
        aria-label={placeholder}
        {...props}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onValueChange(event.target.value)}
        className={cn("px-8", "[&::-webkit-search-cancel-button]:hidden", className)}
      />
      {value !== "" && (
        <IconButton
          size="xs"
          icon="x"
          label={clearLabel}
          {...clearButtonProps}
          className={cn("absolute right-1.5 top-1/2 -translate-y-1/2", clearButtonProps?.className)}
          onClick={onClear}
        />
      )}
    </div>
  );
}

export type DataTableFilterBarProps = ComponentProps<"div">;

export function DataTableFilterBar({
  children,
  className,
  ...props
}: DataTableFilterBarProps): ReactNode {
  return (
    <div {...props} className={cn("border-b border-lt-border px-4 py-3", className)}>
      <div className="flex flex-wrap items-center gap-2 text-sm">{children}</div>
    </div>
  );
}

export type DataTableFilterChipProps = ComponentProps<"span">;

export function DataTableFilterChip({ className, ...props }: DataTableFilterChipProps): ReactNode {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lt-sm bg-lt-muted px-2 py-1",
        className,
      )}
    />
  );
}

export type DataTableSortBarProps = ComponentProps<"div">;

export function DataTableSortBar({ className, ...props }: DataTableSortBarProps): ReactNode {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-wrap items-center gap-4 border-b border-lt-border px-4 py-2.5 text-sm",
        className,
      )}
    />
  );
}

export type DataTableBulkBarProps = ComponentProps<"div"> & {
  action?: ReactNode;
  summary: ReactNode;
};

export function DataTableBulkBar({
  action,
  children,
  className,
  summary,
  ...props
}: DataTableBulkBarProps): ReactNode {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-wrap items-center gap-3 border-b border-lt-border bg-lt-muted/50 p-4 text-sm",
        className,
      )}
    >
      <span className="font-medium">{summary}</span>
      {action}
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export type DataTableGridProps = ComponentProps<"div"> & {
  columns: string;
  pinned?: boolean;
};

export function DataTableGrid({
  children,
  className,
  columns,
  pinned = false,
  style,
  ...props
}: DataTableGridProps): ReactNode {
  return (
    <div data-slot="table-grid-scroll" className="relative overflow-x-auto">
      <div
        role="table"
        {...props}
        className={cn(pinned ? "min-w-max" : "min-w-full", "text-base", className)}
        style={{ "--lattice-table-columns": columns, ...style } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

export type DataTableHeaderProps = ComponentProps<"div">;

export function DataTableHeader(props: DataTableHeaderProps): ReactNode {
  return <div data-slot="table-header" role="rowgroup" {...props} />;
}

export type DataTableHeaderRowProps = ComponentProps<"div">;

export function DataTableHeaderRow({ className, ...props }: DataTableHeaderRowProps): ReactNode {
  return (
    <div
      role="row"
      {...props}
      className={cn(
        "hidden min-w-full md:grid md:grid-cols-[var(--lattice-table-columns)]",
        className,
      )}
    />
  );
}

const headerCellClassName: Record<DataTableTrack, string> = {
  column: "relative min-w-0 px-lt-cell-x py-lt-cell-y pr-5 align-middle font-semibold text-lt-fg",
  expander: "px-2 py-lt-cell-y",
  selection: "flex items-center px-lt-cell-x py-lt-cell-y",
  actions:
    "flex items-center justify-end gap-2 px-lt-cell-x py-2 align-middle font-semibold text-lt-fg",
  filler: "",
};

function ariaSort(
  direction: SortDirection | null | undefined,
): "ascending" | "descending" | undefined {
  if (direction === "asc") {
    return "ascending";
  }

  if (direction === "desc") {
    return "descending";
  }

  return undefined;
}

export type DataTableHeaderCellProps = ComponentProps<"div"> &
  PinProps & {
    align?: ColumnAlign;
    bottomBordered?: boolean;
    kind?: DataTableTrack;
    sortDirection?: SortDirection | null;
  };

export function DataTableHeaderCell({
  align = "start",
  bottomBordered = false,
  className,
  kind = "column",
  pinBoundary,
  pinIndex,
  pinned,
  sortDirection,
  style,
  ...props
}: DataTableHeaderCellProps): ReactNode {
  const pin = { pinBoundary, pinIndex, pinned };
  const presentational = kind === "filler" || kind === "expander";

  return (
    <div
      aria-hidden={presentational ? "true" : undefined}
      aria-sort={kind === "column" ? ariaSort(sortDirection) : undefined}
      role={kind === "filler" ? undefined : "columnheader"}
      {...props}
      className={cn(
        headerCellClassName[kind],
        pinnedHeaderBackground(kind !== "filler" && pinned != null),
        pinClassName(kind, pin),
        bottomBordered && "border-b border-lt-border",
        kind === "column" && alignText[align],
        className,
      )}
      data-pin-boundary={pinBoundary}
      data-pinned={kind === "filler" ? undefined : pinned}
      style={{ ...pinOffsetStyle(kind, pin), ...style }}
    />
  );
}

function SortIndicator({ direction }: { direction: SortDirection | null | undefined }) {
  if (direction === "asc") {
    return <Icon name="arrow-up" aria-hidden="true" className="size-lt-icon-sm shrink-0" />;
  }

  if (direction === "desc") {
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

export type DataTableSortButtonProps = ComponentProps<"button"> & {
  align?: ColumnAlign;
  direction?: SortDirection | null;
};

export function DataTableSortButton({
  align = "start",
  children,
  className,
  direction,
  ...props
}: DataTableSortButtonProps): ReactNode {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "flex w-full items-center gap-1.5 font-semibold",
        alignJustify[align],
        className,
      )}
    >
      <span className={cn("min-w-0 flex-1 truncate", alignText[align])}>{children}</span>
      <SortIndicator direction={direction} />
    </button>
  );
}

export type DataTableHeaderLabelProps = ComponentProps<"span"> & {
  align?: ColumnAlign;
};

export function DataTableHeaderLabel({
  align = "start",
  className,
  ...props
}: DataTableHeaderLabelProps): ReactNode {
  return <span {...props} className={cn("block truncate", alignText[align], className)} />;
}

const filterCellClassName: Record<DataTableTrack, string> = {
  column: "min-w-0 border-t border-b border-lt-border px-2 py-2",
  expander: "border-t border-b border-lt-border px-2 py-2",
  selection: "border-t border-b border-lt-border px-lt-cell-x py-2",
  actions: "border-t border-b border-lt-border px-lt-cell-x py-2",
  filler: "border-t border-b border-lt-border",
};

export type DataTableFilterCellProps = ComponentProps<"div"> &
  PinProps & {
    kind?: DataTableTrack;
  };

export function DataTableFilterCell({
  className,
  kind = "column",
  pinBoundary,
  pinIndex,
  pinned,
  style,
  ...props
}: DataTableFilterCellProps): ReactNode {
  const pin = { pinBoundary, pinIndex, pinned };

  return (
    <div
      aria-hidden={kind === "filler" ? "true" : undefined}
      role={kind === "filler" ? undefined : "cell"}
      {...props}
      className={cn(
        filterCellClassName[kind],
        pinnedHeaderBackground(kind !== "filler" && pinned != null),
        pinClassName(kind, pin),
        className,
      )}
      data-pin-boundary={pinBoundary}
      data-pinned={kind === "filler" ? undefined : pinned}
      style={{ ...pinOffsetStyle(kind, pin), ...style }}
    />
  );
}

export type DataTableBodyProps = ComponentProps<"div">;

export function DataTableBody(props: DataTableBodyProps): ReactNode {
  return <div role="rowgroup" {...props} />;
}

type RowState = { clickable: boolean; striped: boolean };

const RowContext = createContext<RowState>({ clickable: false, striped: false });

export type DataTableRowProps = ComponentProps<"div"> & {
  clickable?: boolean;
  striped?: boolean;
};

export function DataTableRow({
  children,
  className,
  clickable = false,
  striped = false,
  ...props
}: DataTableRowProps): ReactNode {
  return (
    <RowContext.Provider value={{ clickable, striped }}>
      <div
        data-slot="table-row"
        role="row"
        {...props}
        className={cn(
          "group/row grid grid-cols-1 border-b border-lt-border last:border-b-0 md:grid-cols-[var(--lattice-table-columns)]",
          striped && "odd:bg-lt-muted/30",
          clickable && "cursor-pointer hover:bg-lt-muted/50",
          className,
        )}
      >
        {children}
      </div>
    </RowContext.Provider>
  );
}

const bodyCellClassName: Record<DataTableTrack, string> = {
  column: "grid min-w-0 content-center gap-1 overflow-hidden px-lt-cell-x py-lt-cell-y",
  expander: "flex items-center px-2 py-lt-cell-y",
  selection: "flex items-center px-lt-cell-x py-lt-cell-y",
  actions: "items-center justify-start gap-2 px-lt-cell-x py-lt-cell-y md:justify-end",
  filler: "",
};

export type DataTableCellProps = ComponentProps<"div"> &
  PinProps & {
    align?: ColumnAlign;
    kind?: DataTableTrack;
    label?: ReactNode;
  };

export function DataTableCell({
  align = "start",
  children,
  className,
  kind = "column",
  label,
  pinBoundary,
  pinIndex,
  pinned,
  style,
  ...props
}: DataTableCellProps): ReactNode {
  const { clickable, striped } = useContext(RowContext);
  const pin = { pinBoundary, pinIndex, pinned };

  if (kind === "filler") {
    return <div aria-hidden="true" {...props} className={className} style={style} />;
  }

  return (
    <div
      role="cell"
      {...props}
      data-slot={kind === "column" ? "table-cell" : undefined}
      className={cn(
        bodyCellClassName[kind],
        kind === "actions" && (Children.count(children) > 0 ? "flex" : "hidden md:flex"),
        kind === "column" && alignText[align],
        kind === "column" && alignJustifyItems[align],
        pinnedBodyBackground(pinned != null, striped, clickable),
        pinClassName(kind, pin),
        className,
      )}
      data-pin-boundary={pinBoundary}
      data-pinned={pinned}
      style={{ ...pinOffsetStyle(kind, pin), ...style }}
    >
      {kind === "column" ? (
        <>
          <span aria-hidden="true" className="text-xs font-medium text-lt-muted-fg md:hidden">
            {label}
          </span>
          <div
            data-slot="table-cell-content"
            className="min-w-0 max-w-full overflow-hidden truncate"
          >
            {children}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
}

export type DataTableRowToggleProps = Omit<ComponentProps<"button">, "children"> & {
  expanded: boolean;
};

export function DataTableRowToggle({
  className,
  expanded,
  ...props
}: DataTableRowToggleProps): ReactNode {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      {...props}
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-lt-sm text-lt-muted-fg hover:bg-lt-muted hover:text-lt-fg",
        className,
      )}
    >
      <Icon
        name="chevron-down"
        aria-hidden="true"
        className={cn("size-lt-icon-md transition-transform", !expanded && "-rotate-90")}
      />
    </button>
  );
}

export type DataTableRowDetailProps = ComponentProps<"div">;

export function DataTableRowDetail({ className, ...props }: DataTableRowDetailProps): ReactNode {
  return (
    <div
      role="region"
      data-slot="table-row-detail"
      {...props}
      className={cn(
        "border-b border-lt-border bg-lt-muted/20 px-lt-cell-x py-lt-cell-y",
        className,
      )}
    />
  );
}

export type DataTableStatusRowProps = ComponentProps<"div">;

export function DataTableEmpty({
  children,
  className,
  ...props
}: DataTableStatusRowProps): ReactNode {
  return (
    <div
      data-slot="table-empty"
      role="row"
      {...props}
      className={cn("p-8 text-center text-lt-muted-fg", className)}
    >
      <div role="cell">{children}</div>
    </div>
  );
}

export function DataTableLoading({
  children,
  className,
  ...props
}: DataTableStatusRowProps): ReactNode {
  return (
    <div role="row" {...props} className={cn("p-4 text-lt-muted-fg", className)}>
      <div role="cell">{children}</div>
    </div>
  );
}

export type DataTableFooterProps = ComponentProps<"div">;

export function DataTableFooter({ className, ...props }: DataTableFooterProps): ReactNode {
  return (
    <div
      data-slot="table-pagination"
      {...props}
      className={cn(
        "flex items-center justify-between gap-3 border-t border-lt-border p-4 text-sm",
        className,
      )}
    />
  );
}

export type DataTablePaginationLabels = {
  next: string;
  page: (page: number) => string;
  previous: string;
};

export type DataTablePaginationProps = {
  disabled?: boolean;
  hasNextPage: boolean;
  labels: DataTablePaginationLabels;
  onPageChange: (page: number) => void;
  page: number;
  pages?: number[];
};

export function DataTablePagination({
  disabled = false,
  hasNextPage,
  labels,
  onPageChange,
  page,
  pages,
}: DataTablePaginationProps): ReactNode {
  return (
    <div className="flex items-center gap-2">
      <Button
        emphasis="outline"
        data-test="pagination-previous"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {labels.previous}
      </Button>
      {pages?.map((pageNumber) => (
        <Button
          key={pageNumber}
          emphasis="outline"
          size="icon"
          data-test={`pagination-page-${pageNumber}`}
          disabled={disabled || pageNumber === page}
          aria-current={pageNumber === page ? "page" : undefined}
          aria-label={labels.page(pageNumber)}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Button>
      ))}
      <Button
        emphasis="outline"
        data-test="pagination-next"
        disabled={disabled || !hasNextPage}
        onClick={() => onPageChange(page + 1)}
      >
        {labels.next}
      </Button>
    </div>
  );
}
