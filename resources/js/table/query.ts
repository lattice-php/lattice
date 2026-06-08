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

export function buildEndpoint(endpoint: string, state: TableState, componentRef: string): string {
  const url = new URL(endpoint, window.location.origin);

  if (componentRef) {
    url.searchParams.set("_lattice", componentRef);
  }

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

export function getQueryParams(state: TableState): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  const filters = Object.fromEntries(
    Object.entries(state.filters).filter(([, value]) => value !== ""),
  );

  if (Object.keys(filters).length > 0) {
    params.filter = filters;
  }

  if (state.sorts.length > 0) {
    params.sort = state.sorts
      .map((sort) => (sort.direction === "desc" ? `-${sort.key}` : sort.key))
      .join(",");
  }

  return params;
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
  hasSelection = false,
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
