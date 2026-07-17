import { apiFetch, apiJson } from "@lattice-php/lattice/core/api";
import { LATTICE_EVENT, type ReloadComponentEvent } from "@lattice-php/lattice/core/event-names";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Option } from "@lattice-php/lattice/types/generated";
import { isEmptyFilterValue, isFilterValue } from "@lattice-php/lattice/table/lib/filter-values";
import {
  getColumns,
  getPagination,
  getRows,
  getQuery,
} from "@lattice-php/lattice/table/lib/payload";
import { buildEndpoint, nextSort } from "@lattice-php/lattice/table/lib/query";
import type {
  FilterClause,
  TableColumn,
  TableNode,
  TableResult,
  TableSort,
  TableQuery,
} from "@lattice-php/lattice/table/types";

export function useTable(node: TableNode) {
  const columns = useMemo(() => getColumns(node.props?.columns), [node.props?.columns]);
  const endpoint = typeof node.props?.endpoint === "string" ? node.props.endpoint : null;
  const componentRef = typeof node.props?.ref === "string" ? node.props.ref : "";
  const isLazy = node.props?.lazy === true;
  const initialQuery = useMemo(() => getQuery(node.props?.query), [node.props?.query]);
  const initialRows = useMemo(() => getRows(node.props?.data), [node.props?.data]);
  const initialPagination = useMemo(
    () => getPagination(node.props?.pagination),
    [node.props?.pagination],
  );
  const [rows, setRows] = useState(initialRows);
  const [pagination, setPagination] = useState(initialPagination);
  const [query, setQuery] = useState(initialQuery);
  const [processing, setProcessing] = useState(isLazy);
  const [hasLoaded, setHasLoaded] = useState(!isLazy);
  const infiniteLoaderRef = useRef<HTMLDivElement | null>(null);
  const currentPage = pagination.currentPage ?? query.page;
  const isInfinite = (pagination.mode ?? "table") === "infinite";

  const load = useCallback(
    async (nextQuery: TableQuery, append = false): Promise<void> => {
      if (!endpoint) {
        return;
      }

      setProcessing(true);

      try {
        const result = await apiJson<TableResult>(buildEndpoint(endpoint, nextQuery), {
          ref: componentRef,
        });
        const resultQuery = getQuery(result.query);
        const resultRows = getRows(result.data);

        setRows((currentRows) => (append ? [...currentRows, ...resultRows] : resultRows));
        setPagination(getPagination(result.pagination));
        setQuery(resultQuery);
        setHasLoaded(true);
      } finally {
        setProcessing(false);
      }
    },
    [endpoint, componentRef],
  );

  function sort(column: TableColumn): void {
    void load({
      ...query,
      page: 1,
      sorts: nextSort(query.sorts, column),
    });
  }

  function clearSort(sort: TableSort): void {
    void load({
      ...query,
      page: 1,
      sorts: query.sorts.filter((currentSort) => currentSort.key !== sort.key),
    });
  }

  function applyFilters(next: FilterClause[]): void {
    const nextQuery = { ...query, filters: next, page: 1 };

    setQuery(nextQuery);
    void load(nextQuery);
  }

  function addFilter(clause: FilterClause): void {
    applyFilters([...query.filters, clause]);
  }

  function updateFilter(index: number, clause: FilterClause): void {
    applyFilters(query.filters.map((current, position) => (position === index ? clause : current)));
  }

  function removeFilter(index: number): void {
    applyFilters(query.filters.filter((_, current) => current !== index));
  }

  function replaceColumnFilters(field: string, clauses: FilterClause[]): void {
    applyFilters([...query.filters.filter((clause) => clause.field !== field), ...clauses]);
  }

  function setTableFilter(key: string, value: unknown): void {
    const next = { ...query.tableFilters };

    if (isEmptyFilterValue(value) || !isFilterValue(value)) {
      delete next[key];
    } else {
      next[key] = value;
    }

    const nextQuery = {
      ...query,
      tableFilters: next,
      tableFilterIndicators: query.tableFilterIndicators.filter(
        (indicator) => indicator.filter !== key,
      ),
      page: 1,
    };

    setQuery(nextQuery);
    void load(nextQuery);
  }

  function resetFilters(): void {
    const nextQuery = {
      ...query,
      filters: [],
      tableFilters: {},
      tableFilterIndicators: [],
      search: "",
      page: 1,
    };

    setQuery(nextQuery);
    void load(nextQuery);
  }

  function setSearch(search: string): void {
    const nextQuery = { ...query, search, page: 1 };

    setQuery(nextQuery);
    void load(nextQuery);
  }

  const searchFilterOptions = useCallback(
    async (searchKey: string, search: string, signal?: AbortSignal): Promise<Option[]> => {
      if (!endpoint) {
        return [];
      }

      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set("_search", searchKey);
      url.searchParams.set("_q", search);

      const response = await apiFetch(`${url.pathname}${url.search}`, {
        ref: componentRef,
        signal,
        throwOnError: false,
      });

      if (!response.ok) {
        return [];
      }

      const result = (await response.json()) as { options?: Option[] };

      return result.options ?? [];
    },
    [endpoint, componentRef],
  );

  function goToPage(page: number): void {
    void load({
      ...query,
      page,
    });
  }

  const loadMore = useCallback((): void => {
    if (processing || !pagination.hasMore) {
      return;
    }

    void load(
      {
        ...query,
        page: pagination.nextPage ?? currentPage + 1,
      },
      true,
    );
  }, [currentPage, load, pagination.hasMore, pagination.nextPage, processing, query]);

  useEffect(() => {
    setRows(initialRows);
    setPagination(initialPagination);
    setQuery(initialQuery);
    setProcessing(isLazy);
    setHasLoaded(!isLazy);
  }, [initialRows, initialPagination, initialQuery, isLazy]);

  useEffect(() => {
    if (!isLazy || hasLoaded) {
      return;
    }

    void load(query);
  }, [hasLoaded, isLazy, load, query]);

  useEffect(() => {
    function reload(event: Event): void {
      const detail = (event as ReloadComponentEvent).detail;

      if (detail?.component !== node.id) {
        return;
      }

      void load(query);
    }

    window.addEventListener(LATTICE_EVENT.reloadComponent, reload);

    return () => window.removeEventListener(LATTICE_EVENT.reloadComponent, reload);
  }, [load, node.id, query]);

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
    query,
    filters: query.filters,
    tableFilters: query.tableFilters,
    search: query.search,
    addFilter,
    updateFilter,
    removeFilter,
    replaceColumnFilters,
    setTableFilter,
    resetFilters,
    setSearch,
    searchFilterOptions,
    processing,
    hasLoaded,
    infiniteLoaderRef,
    sort,
    clearSort,
    goToPage,
    loadMore,
  };
}
