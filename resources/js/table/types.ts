import type { Node } from "@lattice/core/types";

export type TableColumn = {
  columns?: TableColumn[];
  key: string;
  label: string;
  type?: "stack" | "text";
  sortable?: boolean;
  filter?: {
    enabled?: boolean;
    type?: string;
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

export type TableRowMeta = {
  actions?: Node[];
  key?: string;
};

export type TableSort = {
  key: string;
  direction: string;
};

export type TableState = {
  filters: Record<string, string>;
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
  rows?: TableRowMeta[];
  state?: Partial<TableState>;
};

export type ReloadComponentEvent = CustomEvent<{
  component?: string;
  type?: string;
}>;

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
      pagination?: Record<string, unknown>;
      rows?: TableRowMeta[];
      state?: Record<string, unknown>;
    };
  }
}
