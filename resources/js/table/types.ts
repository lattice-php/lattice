import type { NodeUnionOf, ResolveProps, Schema, WireNode } from "@lattice-php/lattice/core/types";
import type {
  ActionNodeType,
  ColumnFilter,
  ColumnPropsMap,
  ColumnType,
  FilterClause,
  FilterIndicator,
  FilterPropsMap,
  Table,
  TablePagination,
  TableQuery,
  TableResult,
  TableSort,
} from "@lattice-php/lattice/types/generated";

export type {
  ColumnFilter,
  ColumnType,
  FilterClause,
  FilterIndicator,
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

/**
 * Consumer apps augment this via `declare module "@lattice-php/lattice"` to type
 * their custom columns' props; built-ins resolve through `ColumnPropsMap`. The
 * column counterpart of `ComponentProps`.
 */
export interface ColumnProps {}

/**
 * The base `Column` props every column node carries on the wire regardless of
 * type — custom columns extend `Column`, so the unaugmented fallback carries
 * them too. Derived from the generated types (each built-in bakes them in)
 * rather than hand-written.
 */
export type CommonColumnProps = Pick<
  ColumnPropsMap["column.text"],
  "label" | "width" | "align" | "sortable" | "toggleable" | "hiddenByDefault" | "filter"
>;

export type ColumnPropsOf<TType extends string> = ResolveProps<
  ColumnProps,
  ColumnPropsMap,
  TType,
  CommonColumnProps & Record<string, unknown>
>;

/**
 * A column node, authored and consumed like a field/component: `key`/`type`
 * stay top-level, every common concern (`label`/`width`/`filter`/…) lives in
 * `props` on each generated column type. `schema` is only present for a
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
 * props. Schema-based filters no longer need custom client props, but the map
 * remains for existing custom controls during the migration.
 */
export interface FilterProps {}

export type FilterPropsOf<TType extends string> = ResolveProps<
  FilterProps,
  FilterPropsMap,
  TType,
  Record<string, unknown>
>;

export type FilterNodeType = keyof FilterPropsMap & string;

/**
 * A dedicated table filter, authored and consumed like a field/component:
 * `key`/`type` stay top-level, `props` carries `label` plus whatever the
 * filter type contributes. `schema` is the bound field(s) rendering the
 * filter's control and is absent when empty. The filter counterpart of
 * `ColumnNode`.
 */
export type FilterNode<TType extends string = FilterNodeType> = {
  type: TType;
  key: string;
  props: FilterPropsOf<TType>;
  schema?: WireNode[];
};
