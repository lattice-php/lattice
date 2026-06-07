import type { LatticeNode, LatticeRendererComponent } from "@/lattice/core/types";
import { ArrowDown, ArrowUp, Check, ChevronsUpDown, Copy, X } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

type TableColumn = {
  columns?: TableColumn[];
  key: string;
  label: string;
  type?: "stack" | "text";
  sortable?: boolean;
  filter?: {
    enabled?: boolean;
    type?: string;
  };
  date?: {
    format?: string | null;
  };
  copyable?: boolean;
  link?: {
    href?: string | null;
    external?: boolean;
  };
};

type TableRow = Record<string, unknown>;

type TableRowMeta = {
  actions?: LatticeNode[];
  key?: string;
};

type TableSort = {
  key: string;
  direction: string;
};

type TableState = {
  filters: Record<string, string>;
  sorts: TableSort[];
  page: number;
  perPage: number;
};

type TablePagination = {
  currentPage?: number;
  hasMore?: boolean;
  lastPage?: number;
  mode?: "infinite" | "none" | "simple" | "table";
  nextPage?: number | null;
  perPage?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
};

type TableResponse = {
  data?: TableRow[];
  pagination?: TablePagination;
  rows?: TableRowMeta[];
  state?: Partial<TableState>;
};

type ReloadComponentEvent = CustomEvent<{
  component?: string;
  type?: string;
}>;

const TableActionComponent = lazy(() => import("@/lattice/action/components/action"));

declare module "@/lattice/core/types" {
  interface LatticeComponentProps {
    table: {
      columns?: TableColumn[];
      data?: TableRow[];
      endpoint?: string;
      lazy?: boolean;
      layout?: string;
      pagination?: Record<string, unknown>;
      rows?: TableRowMeta[];
      state?: Record<string, unknown>;
    };
  }
}

function getColumns(value: unknown): TableColumn[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (column): column is TableColumn =>
      typeof column === "object" &&
      column !== null &&
      "key" in column &&
      "label" in column &&
      typeof column.key === "string" &&
      typeof column.label === "string",
  );
}

function getRows(value: unknown): TableRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (row): row is TableRow => typeof row === "object" && row !== null && !Array.isArray(row),
  );
}

function getRowMetadata(value: unknown): TableRowMeta[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (row): row is TableRowMeta => typeof row === "object" && row !== null && !Array.isArray(row),
  );
}

function getPagination(value: unknown): TablePagination {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as TablePagination;
}

function flattenColumns(columns: TableColumn[]): TableColumn[] {
  return columns.flatMap((column) => [column, ...flattenColumns(column.columns ?? [])]);
}

function getState(value: unknown): TableState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {
      filters: {},
      sorts: [],
      page: 1,
      perPage: 25,
    };
  }

  const state = value as Partial<TableState>;

  return {
    filters:
      typeof state.filters === "object" && state.filters !== null && !Array.isArray(state.filters)
        ? Object.fromEntries(
            Object.entries(state.filters).map(([key, filter]) => [key, String(filter ?? "")]),
          )
        : {},
    sorts: Array.isArray(state.sorts) ? state.sorts : [],
    page: typeof state.page === "number" ? state.page : 1,
    perPage: typeof state.perPage === "number" ? state.perPage : 25,
  };
}

function formatCell(value: unknown, column?: TableColumn): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (column?.date) {
    return formatDate(value, column.date.format ?? null);
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

function formatDate(value: unknown, format: string | null): string {
  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return formatCell(value);
  }

  if (!format) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  const replacements: Record<string, string> = {
    Y: String(date.getFullYear()),
    y: String(date.getFullYear()).slice(-2),
    m: String(date.getMonth() + 1).padStart(2, "0"),
    n: String(date.getMonth() + 1),
    d: String(date.getDate()).padStart(2, "0"),
    j: String(date.getDate()),
    H: String(date.getHours()).padStart(2, "0"),
    G: String(date.getHours()),
    i: String(date.getMinutes()).padStart(2, "0"),
    s: String(date.getSeconds()).padStart(2, "0"),
  };

  return format.replace(/[YymndjHGis]/g, (token) => replacements[token] ?? token);
}

function resolveLink(column: TableColumn, row: TableRow, value: unknown): string | null {
  if (!column.link) {
    return null;
  }

  const href = column.link.href ?? String(value ?? "");

  if (href === "") {
    return null;
  }

  return href.replace(/\{([^}]+)\}/g, (_, key: string) => {
    if (key === "value") {
      return encodeURIComponent(String(value ?? ""));
    }

    return encodeURIComponent(String(row[key] ?? ""));
  });
}

function copyText(value: string): void {
  if (!navigator.clipboard) {
    return;
  }

  void navigator.clipboard.writeText(value);
}

function getColumnSort(state: TableState, column: TableColumn): TableSort | undefined {
  return state.sorts.find((currentSort) => currentSort.key === column.key);
}

function getSortColumn(columns: TableColumn[], sort: TableSort): TableColumn | undefined {
  return flattenColumns(columns).find((column) => column.key === sort.key);
}

function getColumnAriaSort(sort: TableSort | undefined): "ascending" | "descending" | undefined {
  if (sort?.direction === "asc") {
    return "ascending";
  }

  if (sort?.direction === "desc") {
    return "descending";
  }

  return undefined;
}

function SortIndicator({ sort }: { sort: TableSort | undefined }) {
  if (sort?.direction === "asc") {
    return <ArrowUp aria-hidden="true" className="size-3.5" />;
  }

  if (sort?.direction === "desc") {
    return <ArrowDown aria-hidden="true" className="size-3.5" />;
  }

  return <ChevronsUpDown aria-hidden="true" className="size-3.5 opacity-50" />;
}

function buildEndpoint(endpoint: string, state: TableState): string {
  const url = new URL(endpoint, window.location.origin);

  Object.entries(state.filters)
    .filter(([, value]) => value !== "")
    .forEach(([key, value]) => url.searchParams.set(`filter[${key}]`, value));

  if (state.sorts.length > 0) {
    url.searchParams.set(
      "sort",
      state.sorts.map((sort) => (sort.direction === "desc" ? `-${sort.key}` : sort.key)).join(","),
    );
  }

  url.searchParams.set("page", String(state.page));
  url.searchParams.set("per_page", String(state.perPage));

  return `${url.pathname}${url.search}`;
}

function getSortDirectionLabel(direction: string): string {
  return direction === "desc" ? "descending" : "ascending";
}

function nextSort(sorts: TableSort[], column: TableColumn): TableSort[] {
  if (!column.sortable) {
    return sorts;
  }

  const currentSort = sorts.find((sort) => sort.key === column.key);
  const remainingSorts = sorts.filter((sort) => sort.key !== column.key);

  if (!currentSort) {
    return [...sorts, { key: column.key, direction: "asc" }];
  }

  if (currentSort.direction === "asc") {
    return [...remainingSorts, { key: column.key, direction: "desc" }];
  }

  return remainingSorts;
}

function getRowKey(row: TableRow, index: number): string {
  const key = row.id ?? row.uuid ?? row.key ?? index;

  return String(key);
}

function getVisiblePages(currentPage: number, lastPage: number): number[] {
  if (lastPage <= 5) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(currentPage - 2, lastPage - 4));

  return Array.from({ length: 5 }, (_, index) => start + index);
}

function getColumnGridTemplate(columns: TableColumn[], hasActions: boolean): string {
  const tracks: string[] = columns.map((column) =>
    column.type === "stack" ? "minmax(16rem, 2fr)" : "minmax(9rem, 1fr)",
  );

  if (hasActions) {
    tracks.push("max-content");
  }

  return tracks.join(" ");
}

function getRowMeta(rowMetadata: TableRowMeta[], row: TableRow, index: number): TableRowMeta {
  const rowKey = getRowKey(row, index);

  return rowMetadata.find((metadata) => metadata.key === rowKey) ?? rowMetadata[index] ?? {};
}

const TableComponent: LatticeRendererComponent<"table"> = ({ node }) => {
  const columns = getColumns(node.props?.columns);
  const interactiveColumns = useMemo(() => flattenColumns(columns), [columns]);
  const endpoint = typeof node.props?.endpoint === "string" ? node.props.endpoint : null;
  const isLazy = node.props?.lazy === true;
  const initialState = useMemo(() => getState(node.props?.state), [node.props?.state]);
  const [rows, setRows] = useState(() => getRows(node.props?.data));
  const [rowMetadata, setRowMetadata] = useState(() => getRowMetadata(node.props?.rows));
  const [pagination, setPagination] = useState(() => getPagination(node.props?.pagination));
  const [state, setState] = useState(initialState);
  const [filters, setFilters] = useState(initialState.filters);
  const [processing, setProcessing] = useState(isLazy);
  const [hasLoaded, setHasLoaded] = useState(!isLazy);
  const infiniteLoaderRef = useRef<HTMLDivElement | null>(null);
  const currentPage = pagination.currentPage ?? state.page;
  const lastPage = pagination.lastPage ?? currentPage;
  const paginationType = pagination.mode ?? "table";
  const isInfinite = paginationType === "infinite";
  const isSimple = paginationType === "simple";
  const isTable = paginationType === "table";
  const visiblePages = getVisiblePages(currentPage, lastPage);
  const hasNextPage = pagination.hasMore ?? currentPage < lastPage;
  const hasActions = rowMetadata.some((metadata) => (metadata.actions?.length ?? 0) > 0);
  const gridTemplateColumns = getColumnGridTemplate(columns, hasActions);

  const load = useCallback(
    async (nextState: TableState, append = false): Promise<void> => {
      if (!endpoint) {
        return;
      }

      setProcessing(true);

      try {
        const response = await fetch(buildEndpoint(endpoint, nextState), {
          headers: {
            Accept: "application/json",
          },
        });
        const result = (await response.json()) as TableResponse;
        const resultState = getState(result.state);
        const resultRows = getRows(result.data);
        const resultRowMetadata = getRowMetadata(result.rows);

        setRows((currentRows) => (append ? [...currentRows, ...resultRows] : resultRows));
        setRowMetadata((currentRowMetadata) =>
          append ? [...currentRowMetadata, ...resultRowMetadata] : resultRowMetadata,
        );
        setPagination(getPagination(result.pagination));
        setState(resultState);
        setFilters(resultState.filters);
        setHasLoaded(true);
      } finally {
        setProcessing(false);
      }
    },
    [endpoint],
  );

  function sort(column: TableColumn): void {
    void load({
      ...state,
      page: 1,
      sorts: nextSort(state.sorts, column),
    });
  }

  function clearSort(sort: TableSort): void {
    void load({
      ...state,
      page: 1,
      sorts: state.sorts.filter((currentSort) => currentSort.key !== sort.key),
    });
  }

  function applyFilters(): void {
    void load({
      ...state,
      filters,
      page: 1,
    });
  }

  function page(page: number): void {
    void load({
      ...state,
      page,
    });
  }

  useEffect(() => {
    if (!isLazy || hasLoaded) {
      return;
    }

    void load(state);
  }, [hasLoaded, isLazy, load, state]);

  useEffect(() => {
    function reload(event: Event): void {
      const detail = (event as ReloadComponentEvent).detail;

      if (detail?.component !== node.id) {
        return;
      }

      void load(state);
    }

    window.addEventListener("lattice:reload-component", reload);

    return () => window.removeEventListener("lattice:reload-component", reload);
  }, [load, node.id, state]);

  const loadMore = useCallback((): void => {
    if (processing || !pagination.hasMore) {
      return;
    }

    void load(
      {
        ...state,
        page: pagination.nextPage ?? currentPage + 1,
      },
      true,
    );
  }, [currentPage, load, pagination.hasMore, pagination.nextPage, processing, state]);

  useEffect(() => {
    if (
      !isInfinite ||
      !pagination.hasMore ||
      processing ||
      !infiniteLoaderRef.current ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      {
        rootMargin: "240px",
      },
    );

    observer.observe(infiniteLoaderRef.current);

    return () => observer.disconnect();
  }, [isInfinite, loadMore, pagination.hasMore, processing]);

  return (
    <div data-lattice-component={node.id} className="overflow-hidden rounded-md border">
      {interactiveColumns.some((column) => column.filter?.enabled) && (
        <div className="flex flex-wrap items-end gap-3 border-b p-4">
          {interactiveColumns
            .filter((column) => column.filter?.enabled)
            .map((column) => (
              <label key={column.key} className="grid gap-1 text-sm font-medium">
                <span>{`Filter ${column.label}`}</span>
                <input
                  aria-label={`Filter ${column.label}`}
                  className="h-9 rounded-md border bg-background px-3 text-sm font-normal"
                  value={filters[column.key] ?? ""}
                  onChange={(event) =>
                    setFilters((currentFilters) => ({
                      ...currentFilters,
                      [column.key]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
          <button
            type="button"
            className="h-9 rounded-md border px-3 text-sm font-medium disabled:opacity-50"
            disabled={processing}
            onClick={applyFilters}
          >
            Apply filters
          </button>
        </div>
      )}
      {state.sorts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3 text-sm">
          <span className="font-medium text-muted-foreground">Sorted by</span>
          {state.sorts.map((sort, index) => {
            const column = getSortColumn(columns, sort);
            const label = column?.label ?? sort.key;
            const directionLabel = getSortDirectionLabel(sort.direction);

            return (
              <span
                key={sort.key}
                className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1"
              >
                <span>{`${index + 1}. ${label} ${directionLabel}`}</span>
                <button
                  type="button"
                  className="inline-flex size-5 items-center justify-center rounded hover:bg-muted disabled:opacity-50"
                  disabled={processing}
                  aria-label={`Clear ${label} sort`}
                  data-test={`clear-${sort.key}-sort`}
                  onClick={() => clearSort(sort)}
                >
                  <X aria-hidden="true" className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <div className="w-full text-sm" role="table">
        <div className="border-b bg-muted/50" role="rowgroup">
          <div
            className="hidden min-w-full md:grid md:grid-cols-[var(--lattice-table-columns)]"
            role="row"
            style={{ "--lattice-table-columns": gridTemplateColumns } as never}
          >
            {columns.map((column) => (
              <ColumnHeader
                column={column}
                key={column.key}
                processing={processing}
                sort={sort}
                state={state}
              />
            ))}
            {hasActions && (
              <div
                className="h-10 px-4 text-right align-middle font-medium text-muted-foreground"
                role="columnheader"
              >
                Actions
              </div>
            )}
          </div>
        </div>
        <div role="rowgroup">
          {!hasLoaded ? (
            <div className="p-4 text-muted-foreground" role="row">
              <div role="cell">Loading rows...</div>
            </div>
          ) : (
            rows.map((row, index) => {
              const metadata = getRowMeta(rowMetadata, row, index);
              const actions = metadata.actions ?? [];

              return (
                <div
                  key={metadata.key ?? getRowKey(row, index)}
                  className="grid grid-cols-1 border-b last:border-b-0 md:grid-cols-[var(--lattice-table-columns)]"
                  role="row"
                  style={{ "--lattice-table-columns": gridTemplateColumns } as never}
                >
                  {columns.map((column) => (
                    <div key={column.key} className="grid gap-1 p-4 align-middle" role="cell">
                      <span
                        aria-hidden="true"
                        className="text-xs font-medium text-muted-foreground md:hidden"
                      >
                        {column.label}
                      </span>
                      <ColumnCell column={column} row={row} />
                    </div>
                  ))}
                  {actions.length > 0 && (
                    <div
                      className="flex items-center justify-start gap-2 p-4 md:justify-end"
                      role="cell"
                    >
                      {actions.map((action, actionIndex) => (
                        <Suspense fallback={null} key={action.key ?? action.id ?? actionIndex}>
                          {action.type === "action" ? (
                            <TableActionComponent node={action as LatticeNode<"action">}>
                              {null}
                            </TableActionComponent>
                          ) : null}
                        </Suspense>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      {hasLoaded && (
        <div className="flex items-center justify-between gap-3 border-t p-4 text-sm">
          <span>
            {pagination.total === undefined
              ? `Page ${currentPage}`
              : `Showing ${pagination.from ?? 0}-${pagination.to ?? 0} of ${pagination.total}`}
          </span>
          {isInfinite ? (
            <div ref={infiniteLoaderRef} className="flex items-center gap-2">
              {pagination.hasMore ? (
                <button
                  type="button"
                  className="h-9 rounded-md border px-3 font-medium disabled:opacity-50"
                  disabled={processing}
                  onClick={loadMore}
                >
                  {processing ? "Loading..." : "Load more"}
                </button>
              ) : (
                <span className="text-muted-foreground">All rows loaded</span>
              )}
            </div>
          ) : isSimple ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-9 rounded-md border px-3 font-medium disabled:opacity-50"
                disabled={processing || currentPage <= 1}
                onClick={() => page(currentPage - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className="h-9 rounded-md border px-3 font-medium disabled:opacity-50"
                disabled={processing || !hasNextPage}
                onClick={() => page(currentPage + 1)}
              >
                Next
              </button>
            </div>
          ) : isTable ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-9 rounded-md border px-3 font-medium disabled:opacity-50"
                disabled={processing || currentPage <= 1}
                onClick={() => page(currentPage - 1)}
              >
                Previous
              </button>
              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className="inline-flex size-9 items-center justify-center rounded-md border font-medium disabled:opacity-50"
                  disabled={processing || pageNumber === currentPage}
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                  aria-label={`Page ${pageNumber}`}
                  onClick={() => page(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                className="h-9 rounded-md border px-3 font-medium disabled:opacity-50"
                disabled={processing || !hasNextPage}
                onClick={() => page(currentPage + 1)}
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

function ColumnHeader({
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
      className="h-10 px-4 text-left align-middle font-medium text-muted-foreground"
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
        column.label
      )}
    </div>
  );
}

function ColumnCell({ column, row }: { column: TableColumn; row: TableRow }) {
  if (column.type === "stack") {
    return (
      <div className="grid gap-1">
        {(column.columns ?? []).map((stackedColumn) => (
          <span key={stackedColumn.key}>
            <TextCell column={stackedColumn} row={row} value={row[stackedColumn.key]} />
          </span>
        ))}
      </div>
    );
  }

  return <TextCell column={column} row={row} value={row[column.key]} />;
}

function TextCell({ column, row, value }: { column: TableColumn; row: TableRow; value: unknown }) {
  const text = formatCell(value, column);
  const [copied, setCopied] = useState(false);
  const href = resolveLink(column, row, value);
  const content = href ? (
    <a
      className="underline underline-offset-2"
      href={href}
      rel={column.link?.external ? "noreferrer" : undefined}
      target={column.link?.external ? "_blank" : undefined}
    >
      {text}
    </a>
  ) : (
    text
  );

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1500);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  function handleCopy(): void {
    copyText(text);
    setCopied(true);
  }

  if (!column.copyable) {
    return content;
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span>{content}</span>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs"
        aria-label={`${copied ? "Copied" : "Copy"} ${column.label}`}
        onClick={handleCopy}
      >
        {copied ? (
          <Check aria-hidden="true" className="size-3" />
        ) : (
          <Copy aria-hidden="true" className="size-3" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}

export default TableComponent;
