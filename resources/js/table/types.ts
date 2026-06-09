export type TableColumn = {
  columns?: TableColumn[];
  key: string;
  label: string;
  type?: "stack" | "text";
  sortable?: boolean;
  filter?: {
    enabled?: boolean;
    type?: FilterControlType;
    operators?: string[];
    defaultOperator?: string;
  };
  date?: {
    format?: string | null;
  };
  copyable?: boolean;
  link?: {
    href?: string | null;
    external?: boolean;
  };
};

export type TableRow = Record<string, unknown>;

export type TableSort = {
  key: string;
  direction: string;
};

export type FilterControlType = "text" | "number" | "date" | "boolean";

export type FilterClause = {
  field: string;
  operator: string;
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
  mode?: "infinite" | "none" | "simple" | "table";
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

declare module "@lattice/core/types" {
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
