import type {
  ColumnData,
  ColumnFilter,
  ColumnType,
  FilterOperator,
  PaginationType,
  TableSort,
} from "@lattice/lattice/generated/types";

export type { ColumnData, ColumnFilter, ColumnType, TableSort };

export type TableColumn = ColumnData;

export type TableRow = Record<string, unknown>;

export type FilterClause = {
  field: string;
  operator: FilterOperator;
  value: string;
};

export type TableState = {
  filters: FilterClause[];
  sorts: TableSort[];
  page: number;
  perPage: number;
};

export type TablePagination = {
  currentPage?: number;
  hasMore?: boolean;
  lastPage?: number;
  mode?: PaginationType;
  nextPage?: number | null;
  perPage?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
};

export type TableResponse = {
  data?: TableRow[];
  pagination?: TablePagination;
  state?: Partial<TableState>;
};

declare module "@lattice/lattice/core/types" {
  interface ComponentProps {
    table: {
      bulkActions?: Array<Record<string, unknown>>;
      columns?: TableColumn[];
      data?: TableRow[];
      endpoint?: string;
      ref?: string;
      lazy?: boolean;
      layout?: string;
      striped?: boolean;
      pagination?: Record<string, unknown>;
      state?: Record<string, unknown>;
    };
  }
}
