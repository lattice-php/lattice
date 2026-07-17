import type { NodeUnionOf } from "@lattice-php/lattice/core/types";
import type {
  ActionNodeType,
  ColumnFilter,
  ColumnNode,
  ColumnProps,
  ColumnPropsOf,
  ColumnNodeType,
  CommonColumnProps,
  FilterClause,
  FilterIndicator,
  FilterNode,
  FilterNodeType,
  FilterProps,
  FilterPropsOf,
  Table,
  TablePagination,
  TableQuery,
  TableResult,
  TableSort,
} from "@lattice-php/lattice/types/generated";

export type {
  ColumnFilter,
  ColumnNode,
  ColumnProps,
  ColumnPropsOf,
  ColumnNodeType,
  CommonColumnProps,
  FilterClause,
  FilterIndicator,
  FilterNode,
  FilterNodeType,
  FilterProps,
  FilterPropsOf,
  TablePagination,
  TableQuery,
  TableResult,
  TableSort,
};

export type ActionNode = NodeUnionOf<ActionNodeType>;

export type TableRow = Record<string, unknown>;

export type TableNodeProps = Partial<Table> & {
  data?: TableRow[];
  pagination?: TablePagination;
  query?: Partial<TableQuery>;
};

export type TableNode = {
  type: "table";
  id?: string;
  key?: string;
  props?: TableNodeProps;
};

export type TableColumn = ColumnNode;
