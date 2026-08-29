import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { runAction } from "@lattice-php/action";
import { apiFetch, apiJson, LATTICE_EVENT, useWindowEvent } from "@lattice-php/core";
import type { ReloadComponentEvent } from "@lattice-php/core";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import type { Board as BoardWireProps, BoardColumnData, BoardResult } from "./generated";
import {
  appendColumn,
  cardsFor,
  createBoardState,
  optimisticMove,
  replaceAll,
  replaceColumn,
  setColumnLoading,
  type BoardCard,
  type BoardMoveRequest,
  type BoardStoreState,
} from "./board-store";

async function runBoardMoveAction(
  action: NonNullable<BoardWireProps["moveAction"]>,
  payload: BoardMoveRequest,
  dispatch: ReturnType<typeof useEffectDispatcher>,
): Promise<boolean> {
  const endpoint = action.props.endpoint;

  if (!endpoint) {
    return true;
  }

  return runAction(
    () =>
      apiFetch(endpoint, {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: action.props.method ?? "post",
        ref: action.props.ref ?? "",
        throwOnError: false,
      }),
    dispatch,
  );
}

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
  loadMore: (columnKey: string) => void;
  move: (request: BoardMoveRequest) => Promise<boolean>;
  moving: boolean;
  resetColumn: (columnKey: string) => void;
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

  useEffect(() => {
    if (wireRef.current.columns === columns && wireRef.current.result === result) {
      return;
    }

    wireRef.current = { columns, result };
    inFlightRef.current.clear();
    store.setState((current) => {
      const base = createBoardState(columns);

      return result
        ? replaceAll({ ...base, generation: current.generation }, result)
        : { ...base, generation: current.generation + 1 };
    });
  }, [columns, result, store]);

  const canLoad = endpoint !== null && endpoint !== "";

  const fetchColumn = useCallback(
    (columnKey: string, offset: number) => {
      if (!endpoint) {
        return;
      }

      const generation = store.getState().generation;
      const params = new URLSearchParams({
        column: columnKey,
        limit: String(perColumn),
        offset: String(offset),
      });

      void apiJson<BoardResult>(`${endpoint}?${params.toString()}`, { ref: componentRef ?? "" })
        .then((payload) => {
          if (store.getState().generation !== generation) {
            return;
          }

          const columnCards = payload.columns.find((entry) => entry.key === columnKey);

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
    [componentRef, endpoint, perColumn, store],
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

  const reload = useCallback(() => {
    if (!canLoad || !endpoint) {
      return;
    }

    inFlightRef.current.clear();
    const generation = store.getState().generation;

    void apiJson<BoardResult>(endpoint, { ref: componentRef ?? "" })
      .then((payload) => {
        if (store.getState().generation !== generation) {
          return;
        }

        store.setState((current) => replaceAll(current, payload));
      })
      .catch(() => {});
  }, [canLoad, componentRef, endpoint, store]);

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
      const params = new URLSearchParams({
        column: columnKey,
        limit: String(perColumn),
        offset: "0",
      });

      void apiJson<BoardResult>(`${endpoint}?${params.toString()}`, { ref: componentRef ?? "" })
        .then((payload) => {
          if (store.getState().generation !== generation) {
            return;
          }

          const columnCards = payload.columns.find((entry) => entry.key === columnKey);

          if (columnCards) {
            store.setState((current) => replaceColumn(current, columnCards));
          }
        })
        .catch(() => {});
    },
    [canLoad, componentRef, endpoint, perColumn, store],
  );

  const move = useCallback(
    async (request: BoardMoveRequest): Promise<boolean> => {
      if (!moveAction || store.getState().moving) {
        return false;
      }

      const previous = store.getState();
      const next = optimisticMove(previous, request);

      if (!next) {
        return false;
      }

      const generation = previous.generation;
      store.setState(() => ({ ...next, moving: true }));

      const accepted = await runBoardMoveAction(moveAction, request, dispatch);

      if (!accepted && store.getState().generation === generation) {
        store.setState(() => ({ ...previous, moving: false }));
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
    loadMore,
    move,
    moving: state.moving,
    resetColumn,
  };
}
