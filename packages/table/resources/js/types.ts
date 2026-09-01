import type {
  ColumnProps as CustomColumnProps,
  FilterProps as CustomFilterProps,
  NodeUnionOf,
  ResolveProps,
  Schema,
} from "@lattice-php/core";
import type {
  ComponentPropsMap,
  Column,
  ColumnPropsMap,
  Filter,
  FilterPropsMap,
} from "./generated";
import type { Table, TableNodeType } from "./generated";
export type {
  Column,
  Column as ColumnWireProps,
  ColumnFilter,
  ColumnNodeType,
  Filter,
  Filter as FilterWireProps,
  FilterClause,
  FilterIndicator,
  FilterNodeType,
  SortDirection,
  Table as TableWireProps,
  TableNodeType,
  TablePagination,
  TableQuery,
  TableResult,
  TableSort,
} from "./generated";
export type { ContentAlign, Side } from "@lattice-php/ui";

declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
  interface ColumnProps extends ColumnPropsMap {}
  interface FilterProps extends FilterPropsMap {}
}

export interface ColumnProps extends CustomColumnProps {}
export type ColumnPropsOf<TType extends string> = ResolveProps<
  ColumnProps,
  ColumnPropsMap,
  TType,
  Column & Record<string, unknown>
>;
export type CommonColumnProps = Column;
export type ColumnNode<TType extends string = string> = {
  type: TType;
  key: string;
  props: ColumnPropsOf<TType>;
  schema?: Schema;
};

export interface FilterProps extends CustomFilterProps {}
export type FilterPropsOf<TType extends string> = ResolveProps<
  FilterProps,
  FilterPropsMap,
  TType,
  Filter & Record<string, unknown>
>;
export type FilterNode<TType extends string = string> = {
  type: TType;
  key: string;
  props: FilterPropsOf<TType>;
  schema?: Schema;
};

export type ActionNode = NodeUnionOf<"action" | "action.bulk" | "action.group">;
export type TableRow = Record<string, unknown>;
export type TableNodeProps = Partial<Table>;
export type TableNode = {
  type: TableNodeType;
  id?: string;
  key?: string;
  props?: TableNodeProps;
};
export type TableColumn = ColumnNode;
