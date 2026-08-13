import { useCallback, useEffect, useRef, useState } from "react";
import { apiJson } from "@lattice-php/core/api";
import { useNavigation } from "@lattice-php/ui/navigation";
import type {
  RecordSelectionResponse,
  SearchCategory,
  SearchPagination,
  SearchResponse,
  SearchResult,
} from "./generated";
import { SEARCH_DEBOUNCE_MS, type UseSearchOptions, type UseSearchReturn } from "./types";

function buildUrl(endpoint: string, params: Record<string, string>): string {
  const query = new URLSearchParams(params).toString();

  return query === "" ? endpoint : `${endpoint}${endpoint.includes("?") ? "&" : "?"}${query}`;
}

export function searchResultKey(result: SearchResult): string {
  return `${result.category.name}:${result.item.id}`;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function useSearch({ endpoint, perPage = 20 }: UseSearchOptions): UseSearchReturn {
  const { visit } = useNavigation();
  const [query, setQueryState] = useState("");
  const [categories, setCategories] = useState<SearchCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recent, setRecent] = useState<SearchResult[]>([]);
  const [pagination, setPagination] = useState<SearchPagination | null>(null);
  const [status, setStatus] = useState<UseSearchReturn["status"]>("idle");
  const [error, setError] = useState<string | null>(null);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const searchAbort = useRef<AbortController | null>(null);
  const recentAbort = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(
    async (
      nextQuery: string,
      category: string | null,
      page: number,
      append: boolean,
    ): Promise<void> => {
      searchAbort.current?.abort();
      const controller = new AbortController();
      const currentRequest = (requestId.current += 1);
      searchAbort.current = controller;
      setStatus("loading");
      setError(null);

      try {
        const params: Record<string, string> = {
          query: nextQuery,
          page: String(page),
          per_page: String(perPage),
          counts: "1",
        };

        if (category !== null) {
          params.category = category;
        }

        const payload = await apiJson<SearchResponse>(buildUrl(endpoint, params), {
          signal: controller.signal,
        });

        if (currentRequest !== requestId.current) {
          return;
        }

        setCategories(payload.categories);
        setActiveCategory(payload.state.category);
        setPagination(payload.pagination);
        setResults((current) => (append ? [...current, ...payload.data] : payload.data));

        if (!append) {
          setFocusedKey(payload.data[0] ? searchResultKey(payload.data[0]) : null);
        }

        setStatus("success");
      } catch (caught) {
        if (isAbortError(caught)) {
          return;
        }

        setError(caught instanceof Error ? caught.message : String(caught));
        setStatus("error");
      }
    },
    [endpoint, perPage],
  );

  const setQuery = useCallback(
    (value: string): void => {
      setQueryState(value);
      setFocusedKey(null);
      setResults([]);
      setPagination(null);
      searchAbort.current?.abort();
      requestId.current += 1;

      if (debounce.current !== null) {
        clearTimeout(debounce.current);
      }

      if (value.trim() === "") {
        setStatus("idle");
        setError(null);

        return;
      }

      setStatus("loading");

      debounce.current = setTimeout(() => {
        void run(value, activeCategory, 1, false);
      }, SEARCH_DEBOUNCE_MS);
    },
    [activeCategory, run],
  );

  const setCategory = useCallback(
    (name: string): void => {
      setActiveCategory(name);
      setFocusedKey(null);
      void run(query, name, 1, false);
    },
    [query, run],
  );

  const loadMore = useCallback((): void => {
    if (pagination?.nextPage === null || pagination === null || status === "loading") {
      return;
    }

    void run(query, activeCategory, pagination.nextPage, true);
  }, [activeCategory, pagination, query, run, status]);

  const refreshRecent = useCallback(async (): Promise<void> => {
    recentAbort.current?.abort();
    const controller = new AbortController();
    recentAbort.current = controller;

    try {
      const payload = await apiJson<SearchResponse>(
        buildUrl(endpoint, { recent: "1", per_page: String(perPage) }),
        { signal: controller.signal },
      );
      setRecent(payload.data);
    } catch (caught) {
      if (!isAbortError(caught)) {
        setRecent([]);
      }
    }
  }, [endpoint, perPage]);

  const openResult = useCallback(
    async (result: SearchResult): Promise<void> => {
      try {
        const payload = await apiJson<RecordSelectionResponse>(endpoint, {
          method: "POST",
          body: JSON.stringify({ category: result.category.name, id: result.item.id }),
        });
        visit(payload.data.item.link);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : String(caught));
        setStatus("error");
      }
    },
    [endpoint, visit],
  );

  useEffect(
    () => () => {
      searchAbort.current?.abort();
      recentAbort.current?.abort();

      if (debounce.current !== null) {
        clearTimeout(debounce.current);
      }
    },
    [],
  );

  return {
    query,
    setQuery,
    categories,
    activeCategory,
    setCategory,
    results,
    recent,
    pagination,
    status,
    error,
    focusedKey,
    setFocusedKey,
    loadMore,
    openResult: (result) => void openResult(result),
    refreshRecent: () => void refreshRecent(),
  };
}
