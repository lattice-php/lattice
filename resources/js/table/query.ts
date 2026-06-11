import { flattenColumns } from "./payload";
import type { TableColumn, TableSort, TableState } from "./types";

export function getColumnSort(state: TableState, column: TableColumn): TableSort | undefined {
  return state.sorts.find((currentSort) => currentSort.key === column.key);
}

export function getSortColumn(columns: TableColumn[], sort: TableSort): TableColumn | undefined {
  return flattenColumns(columns).find((column) => column.key === sort.key);
}

export function getColumnAriaSort(
  sort: TableSort | undefined,
): "ascending" | "descending" | undefined {
  if (sort?.direction === "asc") {
    return "ascending";
  }

  if (sort?.direction === "desc") {
    return "descending";
  }

  return undefined;
}

export function buildEndpoint(endpoint: string, state: TableState): string {
  const url = new URL(endpoint, window.location.origin);

  if (state.filters.length > 0) {
    url.searchParams.set("filter", serializeFilters(state));
  }

  if (state.sorts.length > 0) {
    url.searchParams.set("sort", serializeSorts(state));
  }

  url.searchParams.set("page", String(state.page));
  url.searchParams.set("per_page", String(state.perPage));

  return `${url.pathname}${url.search}`;
}

export function getQueryParams(state: TableState): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  if (state.filters.length > 0) {
    params.filter = serializeFilters(state);
  }

  if (state.sorts.length > 0) {
    params.sort = serializeSorts(state);
  }

  return params;
}

function serializeFilters(state: TableState): string {
  return state.filters
    .map((clause) => `${clause.field}:${clause.operator}:${encodeURIComponent(clause.value)}`)
    .join(",");
}

function serializeSorts(state: TableState): string {
  return state.sorts
    .map((sort) => (sort.direction === "desc" ? `-${sort.key}` : sort.key))
    .join(",");
}

const operatorLabels: Record<string, string> = {
  contains: "contains",
  starts_with: "starts with",
  ends_with: "ends with",
  eq: "equals",
  neq: "not equals",
  gt: ">",
  gte: "≥",
  lt: "<",
  lte: "≤",
  in: "in",
  not_in: "not in",
  before: "before",
  after: "after",
  empty: "is empty",
  filled: "is not empty",
};

// Operators that filter on presence alone and carry no value input.
export const VALUELESS_FILTER_OPERATORS = new Set<string>(["empty", "filled"]);

export function operatorLabel(operator: string): string {
  return operatorLabels[operator] ?? operator;
}

export function getSortDirectionLabel(direction: string): string {
  return direction === "desc" ? "descending" : "ascending";
}

export function nextSort(sorts: TableSort[], column: TableColumn): TableSort[] {
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

export function getVisiblePages(currentPage: number, lastPage: number): number[] {
  if (lastPage <= 5) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(currentPage - 2, lastPage - 4));

  return Array.from({ length: 5 }, (_, index) => start + index);
}

export function getColumnGridTemplate(
  columns: TableColumn[],
  hasActions: boolean,
  hasSelection: boolean,
): string {
  const tracks: string[] = columns.map((column) =>
    column.type === "stack" ? "minmax(16rem, 2fr)" : "minmax(9rem, 1fr)",
  );

  if (hasActions) {
    tracks.push("max-content");
  }

  if (hasSelection) {
    tracks.unshift("max-content");
  }

  return tracks.join(" ");
}
