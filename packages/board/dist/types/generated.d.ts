import { Color, Node } from "@lattice-php/core";
export type Board = {
  columns: BoardColumnData[];
  endpoint: string | null;
  moveAction: Node<"action"> | Node<"action.bulk"> | null;
  perColumn: number;
  ref: string | null;
  result: BoardResult | null;
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
};
export type BoardResult = {
  readonly columns: BoardColumnCards[];
};
export type ComponentPropsMap = {
  board: Board;
};
export type NodeType = "board";
