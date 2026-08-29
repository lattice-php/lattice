import { Board as BoardWireProps, BoardColumnData, BoardResult } from "./generated";
import { BoardCard, BoardMoveRequest } from "./board-store";
export type BoardColumnView = {
  cards: BoardCard[];
  hasMore: boolean;
  loading: boolean;
  total: number;
};
export type UseBoardStateResult = {
  canMove: boolean;
  columnKeys: string[];
  columnsView: Map<string, BoardColumnView>;
  loadMore: (columnKey: string) => void;
  move: (request: BoardMoveRequest) => Promise<boolean>;
  moving: boolean;
};
export declare function useBoardState({
  columns,
  componentRef,
  endpoint,
  identity,
  moveAction,
  perColumn,
  result,
}: {
  columns: BoardColumnData[];
  componentRef: string | null;
  endpoint: string | null;
  identity: string | undefined;
  moveAction: BoardWireProps["moveAction"];
  perColumn: number;
  result: BoardResult | null;
}): UseBoardStateResult;
