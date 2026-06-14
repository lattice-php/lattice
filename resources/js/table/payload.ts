import type { Node } from "@lattice-php/lattice/core/types";
import type { FilterClause, TableColumn, TablePagination, TableRow, TableState } from "./types";

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
      "label" in column &&
      typeof column.key === "string" &&
      typeof column.label === "string",
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

export function flattenColumns(columns: TableColumn[]): TableColumn[] {
  return columns.flatMap((column) => [column, ...flattenColumns(column.columns ?? [])]);
}

export function getState(value: unknown): TableState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {
      filters: [],
      sorts: [],
      page: 1,
      perPage: 25,
      tableFilters: {},
    };
  }

  const state = value as Partial<TableState>;

  return {
    filters: getFilters(state.filters),
    sorts: Array.isArray(state.sorts) ? state.sorts : [],
    page: typeof state.page === "number" ? state.page : 1,
    perPage: typeof state.perPage === "number" ? state.perPage : 25,
    tableFilters: getTableFilters(state.tableFilters),
  };
}

/**
 * The wire serializes an empty filter map as `[]` and a populated one as an
 * object, so coerce both to a plain `key => value` record.
 */
function getTableFilters(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

export function getRowKey(row: TableRow, index: number): string {
  const key = row.id ?? row.uuid ?? row.key ?? index;

  return String(key);
}

export function getRowActions(row: TableRow): Node[] {
  return Array.isArray(row.actions) ? (row.actions as Node[]) : [];
}
