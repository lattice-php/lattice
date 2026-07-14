import type { Node } from "@lattice-php/lattice/core/types";
import type {
  FilterClause,
  FilterIndicator,
  TableColumn,
  TablePagination,
  TableRow,
  TableQuery,
} from "@lattice-php/lattice/table/types";

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
  };
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
