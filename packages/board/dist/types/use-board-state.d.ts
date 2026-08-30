import { Option } from '@lattice-php/core';
import { FilterIndicator } from '@lattice-php/table';
import { Board as BoardWireProps, BoardColumnData, BoardResult } from './generated';
import { BoardQueryState } from './board-endpoint';
import { BoardCard, BoardCardSnapshot, BoardMoveRequest } from './board-store';
export type BoardColumnView = {
    cards: BoardCard[];
    hasMore: boolean;
    loading: boolean;
    total: number;
};
export type BoardCardRemoval = BoardCardSnapshot & {
    generation: number;
};
export type UseBoardStateResult = {
    canMove: boolean;
    columnKeys: string[];
    columnsView: Map<string, BoardColumnView>;
    indicators: FilterIndicator[];
    loadMore: (columnKey: string) => void;
    move: (request: BoardMoveRequest) => Promise<boolean>;
    moving: boolean;
    removeCard: (cardId: string) => BoardCardRemoval | null;
    resetColumn: (columnKey: string) => void;
    resetFilters: () => void;
    restoreCard: (removal: BoardCardRemoval | null) => void;
    search: string;
    searchFilterOptions: (searchKey: string, query: string, signal?: AbortSignal) => Promise<Option[]>;
    setSearch: (search: string) => void;
    setTableFilter: (key: string, value: unknown) => void;
    tableFilters: Record<string, unknown>;
};
export declare function useBoardState({ columns, componentRef, endpoint, identity, moveAction, perColumn, query: queryProp, queryKey, result, syncQuery, }: {
    columns: BoardColumnData[];
    componentRef: string | null;
    endpoint: string | null;
    identity: string | undefined;
    moveAction: BoardWireProps["moveAction"];
    perColumn: number;
    query: BoardQueryState;
    queryKey: string | null;
    result: BoardResult | null;
    syncQuery: boolean;
}): UseBoardStateResult;
