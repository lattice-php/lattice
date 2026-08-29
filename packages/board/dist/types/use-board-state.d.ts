import { BoardColumnData, BoardResult } from "./generated";
import { BoardCard } from "./board-store";
export type BoardColumnView = {
  cards: BoardCard[];
  hasMore: boolean;
  loading: boolean;
  total: number;
};
export type UseBoardStateResult = {
  columnKeys: string[];
  columnsView: Map<string, BoardColumnView>;
  loadMore: (columnKey: string) => void;
};
export declare function useBoardState({
  columns,
  componentRef,
  endpoint,
  identity,
  perColumn,
  result,
}: {
  columns: BoardColumnData[];
  componentRef: string | null;
  endpoint: string | null;
  identity: string | undefined;
  perColumn: number;
  result: BoardResult | null;
}): UseBoardStateResult;
