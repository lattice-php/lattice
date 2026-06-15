import { translate } from "@lattice-php/lattice/i18n";
import { DEFAULT_COLUMN_WIDTH } from "@lattice-php/lattice/core/column-sizing";
import type { ColumnWidth } from "@lattice-php/lattice/types/generated";
import type { TableColumn, TableSort, TableState } from "./types";

export function getColumnSort(state: TableState, column: TableColumn): TableSort | undefined {
  return state.sorts.find((currentSort) => currentSort.key === column.key);
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

  appendTableFilters(url, state.tableFilters);

  url.searchParams.set("page", String(state.page));
  url.searchParams.set("per_page", String(state.perPage));

  return `${url.pathname}${url.search}`;
}

/**
 * Serialize the dedicated table filters as Laravel-native bracket params:
 * `tf[key]=v`, repeated `tf[key][]=v` for multi-value, and `tf[key][sub]=v`
 * for structured values (e.g. a date range's from/until). Empty values are
 * dropped so an unset filter never reaches the server.
 */
function appendTableFilters(url: URL, tableFilters: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(getTableFilterParams(tableFilters))) {
    if (typeof value === "string") {
      url.searchParams.set(`tf[${key}]`, value);

      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null && item !== "") {
          url.searchParams.append(`tf[${key}][]`, String(item));
        }
      }

      continue;
    }

    if (typeof value === "object" && value !== null) {
      for (const [subKey, subValue] of Object.entries(value as Record<string, unknown>)) {
        url.searchParams.set(`tf[${key}][${subKey}]`, String(subValue));
      }
    }
  }
}

function getTableFilterParams(tableFilters: Record<string, unknown>): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(tableFilters)) {
    const normalized = normalizeTableFilterValue(value);

    if (normalized !== undefined) {
      params[key] = normalized;
    }
  }

  return params;
}

function normalizeTableFilterValue(value: unknown): unknown | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const items = value.filter((item) => item != null && item !== "").map(String);

    return items.length > 0 ? items : undefined;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value)
      .filter(([, subValue]) => subValue != null && subValue !== "")
      .map(([subKey, subValue]) => [subKey, String(subValue)]);

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }

  return String(value);
}

export function getQueryParams(state: TableState): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  if (state.filters.length > 0) {
    params.filter = serializeFilters(state);
  }

  if (state.sorts.length > 0) {
    params.sort = serializeSorts(state);
  }

  const tableFilters = getTableFilterParams(state.tableFilters);

  if (Object.keys(tableFilters).length > 0) {
    params.tf = tableFilters;
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

export const VALUELESS_FILTER_OPERATORS = new Set<string>(["empty", "filled"]);

export function operatorLabel(operator: string): string {
  return translate("lattice", `operators.${operator}`, operatorLabels[operator] ?? operator);
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

export function getTableSizingColumns(columns: TableColumn[]) {
  return columns.map((column) => ({
    key: column.key,
    label: column.label,
    width: columnWidthOrDefault(column),
  }));
}

function columnWidthOrDefault(column: TableColumn): ColumnWidth {
  return (column.width ?? (column.type === "stack" ? "xl" : DEFAULT_COLUMN_WIDTH)) as ColumnWidth;
}

export function getTableUtilityTracks(hasActions: boolean, hasSelection: boolean) {
  // Utility tracks are fixed because the independent header/filter/body grids would drift with content-sized tracks.
  return {
    leadingTracks: hasSelection ? ["3rem"] : [],
    trailingTracks: hasActions ? ["10rem"] : [],
  };
}
