import { withRefHeader } from "@bambamboole/lattice/core/component-ref";
import type { Node } from "@bambamboole/lattice/core/types";
import { LATTICE_EVENT, type ReloadComponentEvent } from "@bambamboole/lattice/events/event-names";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getColumns, getPagination, getRowMetadata, getRows, getState } from "./payload";
import { buildEndpoint, nextSort } from "./query";
import type { FilterClause, TableColumn, TableResponse, TableSort, TableState } from "./types";

export function useTable(node: Node<"table">) {
  const columns = getColumns(node.props?.columns);
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
        const response = await fetch(buildEndpoint(endpoint, nextState), {
          headers: {
            Accept: "application/json",
            ...withRefHeader(componentRef),
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

  function addFilter(clause: FilterClause): void {
    const next = [...filters, clause];

    setFilters(next);
    void load({
      ...state,
      filters: next,
      page: 1,
    });
  }

  function updateFilter(index: number, clause: FilterClause): void {
    const next = filters.map((current, position) => (position === index ? clause : current));

    setFilters(next);
    void load({
      ...state,
      filters: next,
      page: 1,
    });
  }

  function removeFilter(index: number): void {
    const next = filters.filter((_, current) => current !== index);

    setFilters(next);
    void load({
      ...state,
      filters: next,
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

    window.addEventListener(LATTICE_EVENT.reloadComponent, reload);

    return () => window.removeEventListener(LATTICE_EVENT.reloadComponent, reload);
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
    rows,
    rowMetadata,
    pagination,
    state,
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    processing,
    hasLoaded,
    infiniteLoaderRef,
    sort,
    clearSort,
    goToPage,
    loadMore,
  };
}
