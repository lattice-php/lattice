import { Option } from "@lattice-php/core";
import { FilterIndicator } from "@lattice-php/table";
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
  indicators: FilterIndicator[];
  loadMore: (columnKey: string) => void;
  move: (request: BoardMoveRequest) => Promise<boolean>;
  moving: boolean;
  resetColumn: (columnKey: string) => void;
  resetFilters: () => void;
  search: string;
  searchFilterOptions: (
    searchKey: string,
    query: string,
    signal?: AbortSignal,
  ) => Promise<Option[]>;
  setSearch: (search: string) => void;
  setTableFilter: (key: string, value: unknown) => void;
  tableFilters: Record<string, unknown>;
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
