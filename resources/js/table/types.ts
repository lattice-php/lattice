import type {
  ActionNode,
  ColumnData,
  ColumnFilter,
  ColumnType,
  FilterClause as WireFilterClause,
  FilterOperator,
  PaginationType,
  Table,
  TableSort,
} from "@lattice/lattice/types/generated";

export type { ColumnData, ColumnFilter, ColumnType, TableSort };

export type TableColumn = ColumnData;

export type TableRow = Record<string, unknown>;

/**
 * The wire types `operator` as a free string (validated server-side); on the
 * client a clause always carries a known FilterOperator, built from a column's
 * allowed operators.
 */
export type FilterClause = Omit<WireFilterClause, "operator"> & {
  operator: FilterOperator;
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

/**
 * The table node as it reaches the client: the generated wire props plus the
 * rows, pagination, and state the server hydrates onto it for the initial render.
 */
export type TableNodeProps = Partial<Omit<Table, "bulkActions">> & {
  bulkActions?: ActionNode[];
  data?: TableRow[];
  pagination?: TablePagination;
  state?: Partial<TableState>;
};

export type TableNode = {
  type: "table";
  id?: string;
  key?: string;
  props?: TableNodeProps;
};
