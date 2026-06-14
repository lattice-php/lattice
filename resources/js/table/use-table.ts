import { withHeaders } from "@lattice-php/lattice/core/headers";
import { LATTICE_EVENT, type ReloadComponentEvent } from "@lattice-php/lattice/events/event-names";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getColumns, getPagination, getRows, getState } from "./payload";
import { buildEndpoint, nextSort } from "./query";
import type {
  FilterClause,
  TableColumn,
  TableNode,
  TableResponse,
  TableSort,
  TableState,
} from "./types";

export function useTable(node: TableNode) {
  const columns = useMemo(() => getColumns(node.props?.columns), [node.props?.columns]);
  const endpoint = typeof node.props?.endpoint === "string" ? node.props.endpoint : null;
  const componentRef = typeof node.props?.ref === "string" ? node.props.ref : "";
  const isLazy = node.props?.lazy === true;
  const initialState = useMemo(() => getState(node.props?.state), [node.props?.state]);
  const [rows, setRows] = useState(() => getRows(node.props?.data));
  const [pagination, setPagination] = useState(() => getPagination(node.props?.pagination));
  const [state, setState] = useState(initialState);
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
          headers: withHeaders(componentRef, {
            Accept: "application/json",
          }),
        });
        const result = (await response.json()) as TableResponse;
        const resultState = getState(result.state);
        const resultRows = getRows(result.data);

        setRows((currentRows) => (append ? [...currentRows, ...resultRows] : resultRows));
        setPagination(getPagination(result.pagination));
        setState(resultState);
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

  function applyFilters(next: FilterClause[]): void {
    const nextState = { ...state, filters: next, page: 1 };

    setState(nextState);
    void load(nextState);
  }

  function addFilter(clause: FilterClause): void {
    applyFilters([...state.filters, clause]);
  }

  function updateFilter(index: number, clause: FilterClause): void {
    applyFilters(state.filters.map((current, position) => (position === index ? clause : current)));
  }

  function removeFilter(index: number): void {
    applyFilters(state.filters.filter((_, current) => current !== index));
  }

  function setTableFilter(key: string, value: unknown): void {
    const next = { ...state.tableFilters };

    if (isEmptyFilterValue(value)) {
      delete next[key];
    } else {
      next[key] = value;
    }

    const nextState = { ...state, tableFilters: next, page: 1 };

    setState(nextState);
    void load(nextState);
  }

  function resetFilters(): void {
    const nextState = { ...state, filters: [], tableFilters: {}, page: 1 };

    setState(nextState);
    void load(nextState);
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
    pagination,
    state,
    filters: state.filters,
    tableFilters: state.tableFilters,
    addFilter,
    updateFilter,
    removeFilter,
    setTableFilter,
    resetFilters,
    processing,
    hasLoaded,
    infiniteLoaderRef,
    sort,
    clearSort,
    goToPage,
    loadMore,
  };
}

/**
 * Whether a table-filter value should clear the filter rather than apply it —
 * an empty string, empty list, or an object whose every member is empty.
 */
function isEmptyFilterValue(value: unknown): boolean {
  if (value == null || value === "") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.values(value).every((member) => member == null || member === "");
  }

  return false;
}
