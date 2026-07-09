import { translate } from "@lattice-php/lattice/i18n";
import { DEFAULT_COLUMN_WIDTH } from "@lattice-php/lattice/core/column-sizing";
import type { ColumnWidth } from "@lattice-php/lattice/types/generated";
import { isEmptyMember } from "./filter-values";
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

function appendTableFilters(url: URL, tableFilters: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(getTableFilterParams(tableFilters))) {
    appendTableFilterParam(url, `tf[${key}]`, value);
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
  if (isEmptyMember(value) || Array.isArray(value) || typeof value !== "object") {
    return undefined;
  }

  const entries = Object.entries(value)
    .map(([subKey, subValue]) => [subKey, normalizeTableFilterMember(subValue)] as const)
    .filter((entry): entry is readonly [string, unknown] => entry[1] !== undefined);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function normalizeTableFilterMember(value: unknown): unknown | undefined {
  if (isEmptyMember(value)) {
    return undefined;
  }

  if (Array.isArray(value)) {
    const values = value.map(normalizeTableFilterMember).filter((item) => item !== undefined);

    return values.length > 0 ? values : undefined;
  }

  if (typeof value === "object") {
    if (value === null) {
      return undefined;
    }

    const entries = Object.entries(value)
      .map(([key, item]) => [key, normalizeTableFilterMember(item)] as const)
      .filter((entry): entry is readonly [string, unknown] => entry[1] !== undefined);

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }

  return String(value);
}

function appendTableFilterParam(url: URL, key: string, value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      appendTableFilterParam(url, `${key}[]`, item);
    }

    return;
  }

  if (typeof value === "object" && value !== null) {
    for (const [subKey, subValue] of Object.entries(value)) {
      appendTableFilterParam(url, `${key}[${subKey}]`, subValue);
    }

    return;
  }

  url.searchParams.append(key, String(value));
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
  return translate("lattice", `table.operators.${operator}`, operatorLabels[operator] ?? operator);
}

export function getSortDirectionLabel(direction: string): string {
  return direction === "desc" ? "descending" : "ascending";
}

export function nextSort(sorts: TableSort[], column: TableColumn): TableSort[] {
  if (!column.props.sortable) {
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
    label: column.props.label,
    width: columnWidthOrDefault(column),
  }));
}

function columnWidthOrDefault(column: TableColumn): ColumnWidth {
  return (column.props.width ??
    (column.type === "column.stack" ? "xl" : DEFAULT_COLUMN_WIDTH)) as ColumnWidth;
}

export function getTableUtilityTracks(hasActions: boolean, hasSelection: boolean) {
  // Utility tracks are fixed because the independent header/filter/body grids would drift with content-sized tracks.
  return {
    leadingTracks: hasSelection ? ["3rem"] : [],
    trailingTracks: hasActions ? ["10rem"] : [],
  };
}
