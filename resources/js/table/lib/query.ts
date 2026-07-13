import { translate } from "@lattice-php/lattice/i18n";
import { DEFAULT_COLUMN_WIDTH } from "@lattice-php/lattice/core/hooks/column-sizing";
import type { ColumnWidth } from "@lattice-php/lattice/types/generated";
import { isEmptyMember } from "./filter-values";
import type { TableColumn, TableSort, TableQuery } from "@lattice-php/lattice/table/types";

export function getColumnSort(query: TableQuery, column: TableColumn): TableSort | undefined {
  return query.sorts.find((currentSort) => currentSort.key === column.key);
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

export function buildEndpoint(endpoint: string, query: TableQuery): string {
  const url = new URL(endpoint, window.location.origin);

  if (query.filters.length > 0) {
    url.searchParams.set("filter", serializeFilters(query));
  }

  if (query.sorts.length > 0) {
    url.searchParams.set("sort", serializeSorts(query));
  }

  appendTableFilters(url, query.tableFilters);

  url.searchParams.set("page", String(query.page));
  url.searchParams.set("per_page", String(query.perPage));

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

export function getQueryParams(query: TableQuery): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  if (query.filters.length > 0) {
    params.filter = serializeFilters(query);
  }

  if (query.sorts.length > 0) {
    params.sort = serializeSorts(query);
  }

  const tableFilters = getTableFilterParams(query.tableFilters);

  if (Object.keys(tableFilters).length > 0) {
    params.tf = tableFilters;
  }

  return params;
}

function serializeFilters(query: TableQuery): string {
  return query.filters
    .map((clause) => `${clause.field}:${clause.operator}:${encodeURIComponent(clause.value)}`)
    .join(",");
}

function serializeSorts(query: TableQuery): string {
  return query.sorts
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
  return translate(
    "lattice",
    `table.operators.${operator.replaceAll("_", "-")}`,
    operatorLabels[operator] ?? operator,
  );
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
