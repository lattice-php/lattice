import type {
  FilterClause,
  TableColumn,
  TablePagination,
  TableRow,
  TableRowMeta,
  TableState,
} from "./types";

export function getFilters(value: unknown): FilterClause[] {
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

export function getRowMetadata(value: unknown): TableRowMeta[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (row): row is TableRowMeta => typeof row === "object" && row !== null && !Array.isArray(row),
  );
}

export function getPagination(value: unknown): TablePagination {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
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
    };
  }

  const state = value as Partial<TableState>;

  return {
    filters: getFilters(state.filters),
    sorts: Array.isArray(state.sorts) ? state.sorts : [],
    page: typeof state.page === "number" ? state.page : 1,
    perPage: typeof state.perPage === "number" ? state.perPage : 25,
  };
}

export function getRowKey(row: TableRow, index: number): string {
  const key = row.id ?? row.uuid ?? row.key ?? index;

  return String(key);
}

export function getRowMeta(
  rowMetadata: TableRowMeta[],
  row: TableRow,
  index: number,
): TableRowMeta {
  const rowKey = getRowKey(row, index);

  return rowMetadata.find((metadata) => metadata.key === rowKey) ?? {};
}
