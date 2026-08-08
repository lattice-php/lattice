import type { ColumnNode, FilterNode } from "./types";
import type { Color, Node, Op, Option } from "@lattice-php/core";
import type { ColumnWidth, DateTimeStyle, NumberFormatUnit } from "@lattice-php/ui";

export type BadgeColumn = {
  align: ColumnAlign;
  colors: Record<string | number, Color> | null;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type BooleanColumn = {
  align: ColumnAlign;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type Column = {
  align: ColumnAlign;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type ColumnAlign = "start" | "center" | "end";
export type ColumnFilter = {
  readonly clauseOptions: ColumnFilterOption[];
  readonly control: FilterControl | null;
  readonly defaultOperator: Op;
  readonly multiple: boolean;
  readonly operators: Op[];
  readonly options: Option[];
  readonly searchable: boolean;
  readonly type: FilterType;
};
export type ColumnFilterOption = {
  readonly clauses: ColumnFilterOptionClause[];
  readonly label: string;
  readonly value: string;
};
export type ColumnFilterOptionClause = {
  readonly operator: Op;
  readonly value: string;
};
export type ColumnNodeType =
  | "column.badge"
  | "column.boolean"
  | "column.icon"
  | "column.image"
  | "column.money"
  | "column.number"
  | "column.stack"
  | "column.text";
export type ColumnPropsMap = {
  "column.badge": BadgeColumn;
  "column.boolean": BooleanColumn;
  "column.icon": IconColumn;
  "column.image": ImageColumn;
  "column.money": MoneyColumn;
  "column.number": NumberColumn;
  "column.stack": StackColumn;
  "column.text": TextColumn;
};
export type ComponentPropsMap = {
  table: Table;
};
export type DateRangeFilter = {
  label: string | null;
};
export type Filter = {
  label: string | null;
};
export type FilterClause = {
  readonly field: string;
  readonly operator: Op;
  readonly value: string;
};
export type FilterControl =
  | "filter.select"
  | "filter.ternary"
  | "filter.date-range"
  | "filter.toggle";
export type FilterIndicator = {
  readonly filter: string;
  readonly label: string;
  readonly value: string;
};
export type FilterNodeType =
  | "filter.date-range"
  | "filter.select"
  | "filter.ternary"
  | "filter.toggle";
export type FilterPropsMap = {
  "filter.date-range": DateRangeFilter;
  "filter.select": SelectFilter;
  "filter.ternary": TernaryFilter;
  "filter.toggle": ToggleFilter;
};
export type FilterType = "text" | "number" | "date" | "boolean";
export type IconColumn = {
  align: ColumnAlign;
  colors: Record<string | number, Color> | null;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  icon: string | null;
  icons: Record<string | number, string> | null;
  label: string | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type ImageColumn = {
  align: ColumnAlign;
  circular: boolean;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  previewable: boolean;
  size: number | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type MoneyColumn = {
  align: ColumnAlign;
  copyable: boolean;
  currency: string | null;
  currencyField: string | null;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  maximumFractionDigits: number | null;
  minimumFractionDigits: number | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type NodeType = "table";
export type NumberColumn = {
  align: ColumnAlign;
  compact: boolean;
  copyable: boolean;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  maximumFractionDigits: number | null;
  minimumFractionDigits: number | null;
  sortable: boolean;
  toggleable: boolean;
  unit: NumberFormatUnit | null;
  width: ColumnWidth;
};
export type PaginationType = "none" | "simple" | "table" | "infinite";
export type SelectFilter = {
  label: string | null;
  multiple: boolean;
  options: Option[];
  placeholder: string | null;
  searchable: boolean;
};
export type SortDirection = "asc" | "desc";
export type StackColumn = {
  align: ColumnAlign;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type Table = {
  actionsLabel: string | null;
  bulkActions: Node[];
  columns: ColumnNode[];
  data: Record<string, unknown>[] | null;
  emptyLabel: string | null;
  endpoint: string | null;
  filters: FilterNode[];
  layout: string | null;
  lazy: boolean;
  pagination: TablePagination | null;
  perPageOptions: (number | string)[];
  query: TableQuery | null;
  ref: string | null;
  resizableColumns: boolean;
  resizeIndicator: boolean;
  searchable: boolean;
  striped: boolean;
  toolbar: Node[];
};
export type TableNodeType = "table";
export type TablePagination = {
  readonly currentPage: number | null;
  readonly from: number | null;
  readonly hasMore: boolean;
  readonly lastPage: number | null;
  readonly mode: PaginationType;
  readonly nextPage: number | null;
  readonly perPage: number | null;
  readonly to: number | null;
  readonly total: number | null;
};
export type TableQuery = {
  readonly filters: FilterClause[];
  readonly mode: PaginationType | null;
  readonly page: number;
  readonly perPage: number;
  readonly search: string;
  readonly sorts: TableSort[];
  readonly tableFilterIndicators: FilterIndicator[];
  readonly tableFilters: Record<string, Record<string, unknown>>;
};
export type TableResult = {
  readonly data: Record<string, unknown>[];
  readonly pagination: TablePagination | null;
  readonly query: TableQuery;
};
export type TableSort = {
  readonly direction: SortDirection;
  readonly key: string;
};
export type TernaryFilter = {
  falseLabel: string;
  label: string | null;
  placeholder: string;
  trueLabel: string;
};
export type TextColumn = {
  align: ColumnAlign;
  badge: {
    colorKey: string;
  } | null;
  copyable: boolean;
  date: {
    dateStyle: DateTimeStyle | null;
    timeStyle: DateTimeStyle | null;
  } | null;
  filter: ColumnFilter | null;
  hiddenByDefault: boolean;
  label: string | null;
  link: {
    external: boolean;
    href: string | null;
  } | null;
  multiple: string | null;
  sortable: boolean;
  toggleable: boolean;
  width: ColumnWidth;
};
export type ToggleFilter = {
  label: string | null;
};
