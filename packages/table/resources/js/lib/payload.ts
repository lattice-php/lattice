import type { Node } from "@lattice-php/core/types";
import type { PaginationType } from "../generated";
import type {
  FilterClause,
  FilterIndicator,
  TableColumn,
  TablePagination,
  TableRow,
  TableQuery,
} from "@lattice-php/table/types";

function getFilters(value: unknown): FilterClause[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (clause): clause is FilterClause =>
      typeof clause === "object" &&
      clause !== null &&
      typeof clause.field === "string" &&
      typeof clause.operator === "string" &&
      typeof clause.value === "string",
  );
}

export function getColumns(value: unknown): TableColumn[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (column): column is TableColumn =>
      typeof column === "object" &&
      column !== null &&
      "key" in column &&
      "props" in column &&
      typeof column.key === "string" &&
      typeof column.props === "object" &&
      column.props !== null &&
      typeof (column.props as Record<string, unknown>).label === "string",
  );
}

export function getRows(value: unknown): TableRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (row): row is TableRow => typeof row === "object" && row !== null && !Array.isArray(row),
  );
}

const EMPTY_PAGINATION: TablePagination = {
  mode: "none",
  currentPage: null,
  lastPage: null,
  perPage: null,
  total: null,
  from: null,
  to: null,
  hasMore: false,
  nextPage: null,
};

export function getPagination(value: unknown): TablePagination {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return EMPTY_PAGINATION;
  }

  return value as TablePagination;
}

export function getQuery(value: unknown): TableQuery {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {
      filters: [],
      sorts: [],
      page: 1,
      perPage: 25,
      tableFilters: {},
      tableFilterIndicators: [],
      search: "",
      mode: null,
    };
  }

  const query = value as Partial<TableQuery>;

  return {
    filters: getFilters(query.filters),
    sorts: Array.isArray(query.sorts) ? query.sorts : [],
    page: typeof query.page === "number" ? query.page : 1,
    perPage: typeof query.perPage === "number" ? query.perPage : 25,
    tableFilters: getTableFilters(query.tableFilters),
    tableFilterIndicators: getTableFilterIndicators(query.tableFilterIndicators),
    search: typeof query.search === "string" ? query.search : "",
    mode: getPaginationMode(query.mode),
  };
}

const PAGINATION_MODES = new Set(["none", "simple", "table", "infinite"]);

function getPaginationMode(value: unknown): PaginationType | null {
  return typeof value === "string" && PAGINATION_MODES.has(value)
    ? (value as PaginationType)
    : null;
}

export type PerPageOption = number | "infinite";

export function getPerPageOptions(value: unknown): PerPageOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (option): option is PerPageOption => typeof option === "number" || option === "infinite",
  );
}

/**
 * The wire serializes an empty filter map as `[]` and a populated one as an
 * object, so coerce both to a plain `key => value` record.
 */
function getTableFilters(value: unknown): Record<string, Record<string, unknown>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, Record<string, unknown>] =>
        typeof entry[1] === "object" && entry[1] !== null && !Array.isArray(entry[1]),
    ),
  );
}

function getTableFilterIndicators(value: unknown): FilterIndicator[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (indicator): indicator is FilterIndicator =>
      typeof indicator === "object" &&
      indicator !== null &&
      typeof indicator.filter === "string" &&
      typeof indicator.label === "string" &&
      typeof indicator.value === "string",
  );
}

export function getRowKey(row: TableRow, index: number): string {
  const key = row.id ?? row.uuid ?? row.key ?? index;

  return String(key);
}

export function getRowActions(row: TableRow): Node[] {
  return Array.isArray(row.actions) ? (row.actions as Node[]) : [];
}

export function getRowDetail(row: TableRow): Node | null {
  const detail = row.detail;

  return typeof detail === "object" && detail !== null && !Array.isArray(detail)
    ? (detail as Node)
    : null;
}

export function getRowUrl(row: TableRow): string | null {
  return typeof row.rowUrl === "string" ? row.rowUrl : null;
}

export function getRowPopover(row: TableRow, columnKey: string): Node | null {
  const popovers = row.popovers;

  if (typeof popovers !== "object" || popovers === null || Array.isArray(popovers)) {
    return null;
  }

  const popover = (popovers as Record<string, unknown>)[columnKey];

  return typeof popover === "object" && popover !== null && !Array.isArray(popover)
    ? (popover as Node)
    : null;
}

/**
 * Resolves a row's closure-driven link for a column: a string href, `null`
 * when the column has a resolver but this row didn't resolve one (render
 * plain text), or `undefined` when the column has no resolver at all (fall
 * back to the string-template form).
 */
export function getRowLink(row: TableRow, columnKey: string): string | null | undefined {
  const links = row.links;

  if (typeof links !== "object" || links === null || Array.isArray(links)) {
    return undefined;
  }

  const record = links as Record<string, unknown>;

  if (!(columnKey in record)) {
    return undefined;
  }

  const link = record[columnKey];

  return typeof link === "string" ? link : null;
}
