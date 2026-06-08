import type { Node } from "@lattice/core/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  flattenColumns,
  getColumns,
  getPagination,
  getRowMetadata,
  getRows,
  getState,
} from "./payload";
import { buildEndpoint, nextSort } from "./query";
import type {
  ReloadComponentEvent,
  TableColumn,
  TableResponse,
  TableSort,
  TableState,
} from "./types";

export function useTable(node: Node<"table">) {
  const columns = getColumns(node.props?.columns);
  const interactiveColumns = useMemo(() => flattenColumns(columns), [columns]);
  const endpoint = typeof node.props?.endpoint === "string" ? node.props.endpoint : null;
  const componentRef = typeof node.props?.ref === "string" ? node.props.ref : "";
  const isLazy = node.props?.lazy === true;
  const initialState = useMemo(() => getState(node.props?.state), [node.props?.state]);
  const [rows, setRows] = useState(() => getRows(node.props?.data));
  const [rowMetadata, setRowMetadata] = useState(() => getRowMetadata(node.props?.rows));
  const [pagination, setPagination] = useState(() => getPagination(node.props?.pagination));
  const [state, setState] = useState(initialState);
  const [filters, setFilters] = useState(initialState.filters);
  const [processing, setProcessing] = useState(isLazy);
  const [hasLoaded, setHasLoaded] = useState(!isLazy);
  const infiniteLoaderRef = useRef<HTMLDivElement | null>(null);
  const currentPage = pagination.currentPage ?? state.page;
  const isInfinite = (pagination.mode ?? "table") === "infinite";

  const load = useCallback(
    async (nextState: TableState, append = false): Promise<void> => {
      if (!endpoint) {
        return;
      }

      setProcessing(true);

      try {
        const response = await fetch(buildEndpoint(endpoint, nextState, componentRef), {
          headers: {
            Accept: "application/json",
          },
        });
        const result = (await response.json()) as TableResponse;
        const resultState = getState(result.state);
        const resultRows = getRows(result.data);
        const resultRowMetadata = getRowMetadata(result.rows);

        setRows((currentRows) => (append ? [...currentRows, ...resultRows] : resultRows));
        setRowMetadata((currentRowMetadata) =>
          append ? [...currentRowMetadata, ...resultRowMetadata] : resultRowMetadata,
        );
        setPagination(getPagination(result.pagination));
        setState(resultState);
        setFilters(resultState.filters);
        setHasLoaded(true);
      } finally {
        setProcessing(false);
      }
    },
    [endpoint, componentRef],
  );

  function sort(column: TableColumn): void {
    void load({
      ...state,
      page: 1,
      sorts: nextSort(state.sorts, column),
    });
  }

  function clearSort(sort: TableSort): void {
    void load({
      ...state,
      page: 1,
      sorts: state.sorts.filter((currentSort) => currentSort.key !== sort.key),
    });
  }

  function applyFilters(): void {
    void load({
      ...state,
      filters,
      page: 1,
    });
  }

  function goToPage(page: number): void {
    void load({
      ...state,
      page,
    });
  }

  const loadMore = useCallback((): void => {
    if (processing || !pagination.hasMore) {
      return;
    }

    void load(
      {
        ...state,
        page: pagination.nextPage ?? currentPage + 1,
      },
      true,
    );
  }, [currentPage, load, pagination.hasMore, pagination.nextPage, processing, state]);

  useEffect(() => {
    if (!isLazy || hasLoaded) {
      return;
    }

    void load(state);
  }, [hasLoaded, isLazy, load, state]);

  useEffect(() => {
    function reload(event: Event): void {
      const detail = (event as ReloadComponentEvent).detail;

      if (detail?.component !== node.id) {
        return;
      }

      void load(state);
    }

    window.addEventListener("lattice:reload-component", reload);

    return () => window.removeEventListener("lattice:reload-component", reload);
  }, [load, node.id, state]);

  useEffect(() => {
    if (
      !isInfinite ||
      !pagination.hasMore ||
      processing ||
      !infiniteLoaderRef.current ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      {
        rootMargin: "240px",
      },
    );

    observer.observe(infiniteLoaderRef.current);

    return () => observer.disconnect();
  }, [isInfinite, loadMore, pagination.hasMore, processing]);

  return {
    columns,
    interactiveColumns,
    rows,
    rowMetadata,
    pagination,
    state,
    filters,
    setFilters,
    processing,
    hasLoaded,
    infiniteLoaderRef,
    sort,
    clearSort,
    applyFilters,
    goToPage,
    loadMore,
  };
}
