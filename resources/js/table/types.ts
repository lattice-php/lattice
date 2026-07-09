import type { NodeUnionOf, ResolveProps, Schema } from "@lattice-php/lattice/core/types";
import type {
  ActionNodeType,
  ColumnAlign,
  ColumnFilter,
  ColumnPropsMap,
  ColumnType,
  ColumnWidth,
  FilterClause as WireFilterClause,
  FilterPropsMap,
  Op,
  Table,
  TablePagination,
  TableQuery,
  TableSort,
} from "@lattice-php/lattice/types/generated";

export type { ColumnFilter, ColumnType, TablePagination, TableSort };

export type ActionNode = NodeUnionOf<ActionNodeType>;

export type TableRow = Record<string, unknown>;

/**
 * The wire types `operator` as a free string (validated server-side); on the
 * client a clause always carries a known Op, built from a column's
 * allowed operators.
 */
export type FilterClause = Omit<WireFilterClause, "operator"> & {
  operator: Op;
};

export type TableState = Omit<TableQuery, "filters"> & {
  filters: FilterClause[];
};

export type TableResponse = {
  data?: TableRow[];
  pagination?: TablePagination;
  state?: Partial<TableState>;
};

/** The generated wire props plus the rows/pagination/state the server hydrates on for the first render. */
export type TableNodeProps = Partial<Omit<Table, "bulkActions" | "columns">> & {
  bulkActions?: ActionNode[];
  columns?: ColumnNode[];
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

/**
 * Consumer apps augment this via `declare module "@lattice-php/lattice"` to type
 * their custom columns' props; built-ins resolve through `ColumnPropsMap`. The
 * column counterpart of `ComponentProps`.
 */
export interface ColumnProps {}

/**
 * Mirrors `CommonNodeProps`: the concerns `Column::decorateProps` injects into
 * every column's `props` on the wire, regardless of type.
 */
export type CommonColumnProps = {
  label: string;
  width: ColumnWidth;
  align: ColumnAlign;
  sortable: boolean | null;
  toggleable: boolean | null;
  hiddenByDefault: boolean | null;
  filter: ColumnFilter | null;
};

export type ColumnPropsOf<TType extends string> = ResolveProps<
  ColumnProps,
  ColumnPropsMap,
  TType,
  Record<string, unknown>
> &
  CommonColumnProps;

/**
 * A column node, authored and consumed like a field/component: `key`/`type`
 * stay top-level, every common concern (`label`/`width`/`filter`/…) lives in
 * `props` via `CommonColumnProps`. `schema` is only present for a
 * `StackColumn`: the bound component nodes rendered per row (see
 * `materializeSchema`). The column counterpart of `NodeOfType`.
 */
export type ColumnNode<TType extends string = string> = {
  type: TType;
  key: string;
  props: ColumnPropsOf<TType>;
  schema?: Schema;
};

export type TableColumn = ColumnNode;

/**
 * Consumer apps augment this via `declare module` to type their custom filters'
 * props; built-ins resolve through `FilterPropsMap`. The filter counterpart of
 * `ColumnProps`.
 */
export interface FilterProps {}

export type FilterPropsOf<TType extends string> = ResolveProps<
  FilterProps,
  FilterPropsMap,
  TType,
  Record<string, unknown>
>;
