import { Color, Node } from "@lattice-php/core";
import { FilterIndicator } from "@lattice-php/table";
import { FilterNode } from "@lattice-php/table/types";
export type Board = {
  cardAction: Node<"action"> | Node<"action.bulk"> | null;
  columns: BoardColumnData[];
  createAction: Node<"action"> | Node<"action.bulk"> | null;
  endpoint: string | null;
  filters: FilterNode[];
  moveAction: Node<"action"> | Node<"action.bulk"> | null;
  perColumn: number;
  query: {
    q: string;
    tf: Record<string, unknown>;
  };
  queryKey: string | null;
  ref: string | null;
  result: BoardResult | null;
  searchable: boolean;
  syncQuery: boolean;
};
export type BoardColumnCards = {
  readonly cards: Record<string, unknown>[];
  readonly hasMore: boolean;
  readonly key: string;
  readonly offset: number;
  readonly total: number;
};
export type BoardColumnData = {
  readonly color: Color | null;
  readonly icon: string | null;
  readonly key: string;
  readonly label: string;
};
export type BoardNodeType = "board";
export type BoardQuery = {
  readonly column: string | null;
  readonly limit: number;
  readonly offset: number;
  readonly search: string;
  readonly tableFilterIndicators: FilterIndicator[];
  readonly tableFilters: Record<string, Record<string, unknown>>;
};
export type BoardResult = {
  readonly columns: BoardColumnCards[];
  readonly indicators: FilterIndicator[];
};
export type ComponentPropsMap = {
  board: Board;
};
export type NodeType = "board";
