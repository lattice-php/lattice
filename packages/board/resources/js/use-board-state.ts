import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { callAction } from "@lattice-php/action";
import { apiJson, LATTICE_EVENT, useWindowEvent } from "@lattice-php/core";
import type { Option, ReloadComponentEvent } from "@lattice-php/core";
import { fetchFilterOptions, isActiveFilterValue, type FilterIndicator } from "@lattice-php/table";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import type {
  Board as BoardWireProps,
  BoardColumnCards,
  BoardColumnData,
  BoardResult,
} from "./generated";
import { buildBoardEndpoint, emptyBoardQuery, type BoardQueryState } from "./board-endpoint";
import {
  appendColumn,
  cardsFor,
  createBoardState,
  locateCard,
  optimisticMove,
  replaceAll,
  replaceColumn,
  setColumnLoading,
  type BoardCard,
  type BoardMoveRequest,
  type BoardStoreState,
} from "./board-store";

function createStore(initial: BoardStoreState) {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (updater: (current: BoardStoreState) => BoardStoreState) => {
      state = updater(state);
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

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

export function useBoardState({
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
}): UseBoardStateResult {
  const [store] = useState(() => {
    const initial = createBoardState(columns);

    return createStore(result ? replaceAll(initial, result) : initial);
  });
  const state = useSyncExternalStore(store.subscribe, store.getState);
  const inFlightRef = useRef<Set<string>>(new Set());
  const wireRef = useRef({ columns, result });
  const dispatch = useEffectDispatcher();
  const [query, setQuery] = useState<BoardQueryState>(emptyBoardQuery());
  const queryRef = useRef(query);
  queryRef.current = query;
  const [indicators, setIndicators] = useState<FilterIndicator[]>(result?.indicators ?? []);

  useEffect(() => {
    if (wireRef.current.columns === columns && wireRef.current.result === result) {
      return;
    }

    wireRef.current = { columns, result };
    inFlightRef.current.clear();
    setQuery(emptyBoardQuery());
    setIndicators(result?.indicators ?? []);
    store.setState((current) => {
      const base = createBoardState(columns);

      return result
        ? replaceAll({ ...base, generation: current.generation }, result)
        : { ...base, generation: current.generation + 1 };
    });
  }, [columns, result, store]);

  const canLoad = endpoint !== null && endpoint !== "";

  const fetchColumnCards = useCallback(
    (columnKey: string, offset: number): Promise<BoardColumnCards | null> => {
      if (!endpoint) {
        return Promise.resolve(null);
      }

      const url = buildBoardEndpoint(endpoint, queryRef.current, {
        column: columnKey,
        limit: String(perColumn),
        offset: String(offset),
      });

      return apiJson<BoardResult>(url, { ref: componentRef ?? "" }).then(
        (payload) => payload.columns.find((entry) => entry.key === columnKey) ?? null,
      );
    },
    [componentRef, endpoint, perColumn],
  );

  const fetchColumn = useCallback(
    (columnKey: string, offset: number) => {
      const generation = store.getState().generation;

      void fetchColumnCards(columnKey, offset)
        .then((columnCards) => {
          if (store.getState().generation !== generation) {
            return;
          }

          store.setState((current) =>
            columnCards
              ? appendColumn(current, columnCards)
              : setColumnLoading(current, columnKey, false),
          );
        })
        .catch(() => {
          store.setState((current) => setColumnLoading(current, columnKey, false));
        })
        .finally(() => {
          inFlightRef.current.delete(columnKey);
        });
    },
    [fetchColumnCards, store],
  );

  const loadMore = useCallback(
    (columnKey: string) => {
      if (!canLoad || inFlightRef.current.has(columnKey)) {
        return;
      }

      const meta = store.getState().meta.get(columnKey);

      if (!meta || !meta.hasMore || meta.loading) {
        return;
      }

      inFlightRef.current.add(columnKey);
      store.setState((current) => setColumnLoading(current, columnKey, true));
      fetchColumn(columnKey, meta.offset);
    },
    [canLoad, fetchColumn, store],
  );

  const reloadWithQuery = useCallback(
    (nextQuery: BoardQueryState) => {
      if (!canLoad || !endpoint) {
        return;
      }

      inFlightRef.current.clear();

      let generation = 0;

      store.setState((current) => {
        generation = current.generation + 1;

        return { ...current, generation };
      });

      void apiJson<BoardResult>(buildBoardEndpoint(endpoint, nextQuery), {
        ref: componentRef ?? "",
      })
        .then((payload) => {
          if (store.getState().generation !== generation) {
            return;
          }

          store.setState((current) => replaceAll(current, payload));
          setIndicators(payload.indicators ?? []);
        })
        .catch(() => {});
    },
    [canLoad, componentRef, endpoint, store],
  );

  const reload = useCallback(() => {
    reloadWithQuery(queryRef.current);
  }, [reloadWithQuery]);

  const setSearch = useCallback(
    (search: string) => {
      const nextQuery = { ...queryRef.current, q: search };

      queryRef.current = nextQuery;
      setQuery(nextQuery);
      reloadWithQuery(nextQuery);
    },
    [reloadWithQuery],
  );

  const setTableFilter = useCallback(
    (key: string, value: unknown) => {
      const tf = { ...queryRef.current.tf };

      if (isActiveFilterValue(value)) {
        tf[key] = value;
      } else {
        delete tf[key];
      }

      const nextQuery = { ...queryRef.current, tf };

      queryRef.current = nextQuery;
      setQuery(nextQuery);
      reloadWithQuery(nextQuery);
    },
    [reloadWithQuery],
  );

  const resetFilters = useCallback(() => {
    const nextQuery = emptyBoardQuery();

    queryRef.current = nextQuery;
    setQuery(nextQuery);
    reloadWithQuery(nextQuery);
  }, [reloadWithQuery]);

  const searchFilterOptions = useCallback(
    (searchKey: string, search: string, signal?: AbortSignal): Promise<Option[]> =>
      fetchFilterOptions(endpoint, componentRef ?? "", searchKey, search, signal),
    [componentRef, endpoint],
  );

  /**
   * The quick-add follow-up: refetches a single column's first page and
   * replaces its cards wholesale, rather than optimistically inserting the
   * created card client-side — the server's `cardData()`/`cardActions()`
   * decoration and its own ordering stay authoritative.
   */
  const resetColumn = useCallback(
    (columnKey: string) => {
      if (!canLoad || !endpoint) {
        return;
      }

      const generation = store.getState().generation;

      void fetchColumnCards(columnKey, 0)
        .then((columnCards) => {
          if (store.getState().generation !== generation || !columnCards) {
            return;
          }

          store.setState((current) => replaceColumn(current, columnCards));
        })
        .catch(() => {});
    },
    [canLoad, endpoint, fetchColumnCards, store],
  );

  const move = useCallback(
    async (request: BoardMoveRequest): Promise<boolean> => {
      if (!moveAction || store.getState().moving) {
        return false;
      }

      const previous = store.getState();
      const origin = locateCard(previous, request.cardId);
      const next = optimisticMove(previous, request);

      if (!next) {
        return false;
      }

      const generation = previous.generation;
      store.setState(() => ({ ...next, moving: true }));

      const { ok: accepted } = await callAction(moveAction, { ...request }, dispatch);

      if (!accepted && origin !== null && store.getState().generation === generation) {
        store.setState((current) => {
          const reverted = optimisticMove(current, {
            cardId: request.cardId,
            columnKey: origin.columnKey,
            position: origin.index,
          });

          return { ...(reverted ?? current), moving: false };
        });
      } else {
        store.setState((current) => ({ ...current, moving: false }));
      }

      return accepted;
    },
    [dispatch, moveAction, store],
  );

  useWindowEvent(LATTICE_EVENT.reloadComponent, (event) => {
    const detail = (event as ReloadComponentEvent).detail;

    if (identity !== undefined && detail?.component === identity) {
      reload();
    }
  });

  const columnKeys = useMemo(() => columns.map((column) => column.key), [columns]);

  const columnsView = useMemo(() => {
    const map = new Map<string, BoardColumnView>();

    for (const key of columnKeys) {
      const meta = state.meta.get(key);

      map.set(key, {
        cards: cardsFor(state, key),
        hasMore: meta?.hasMore ?? false,
        loading: meta?.loading ?? false,
        total: meta?.total ?? 0,
      });
    }

    return map;
  }, [columnKeys, state]);

  return {
    canMove: Boolean(moveAction),
    columnKeys,
    columnsView,
    indicators,
    loadMore,
    move,
    moving: state.moving,
    resetColumn,
    resetFilters,
    search: query.q,
    searchFilterOptions,
    setSearch,
    setTableFilter,
    tableFilters: query.tf,
  };
}
