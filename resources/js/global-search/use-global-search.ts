import { useCallback, useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { apiJson } from "@lattice-php/lattice/core/api";
import {
  GLOBAL_SEARCH_DEBOUNCE_MS,
  type RecordResponse,
  type SearchCategory,
  type SearchPagination,
  type SearchResponse,
  type SearchResult,
  type UseGlobalSearchOptions,
  type UseGlobalSearchReturn,
} from "./types";

function buildUrl(endpoint: string, params: Record<string, string>): string {
  const search = new URLSearchParams(params).toString();

  return search === "" ? endpoint : `${endpoint}?${search}`;
}

export function useGlobalSearch({
  endpoint,
  perPage = 20,
}: UseGlobalSearchOptions): UseGlobalSearchReturn {
  const [query, setQueryState] = useState("");
  const [categories, setCategories] = useState<SearchCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recent, setRecent] = useState<SearchResult[]>([]);
  const [pagination, setPagination] = useState<SearchPagination | null>(null);
  const [status, setStatus] = useState<UseGlobalSearchReturn["status"]>("idle");
  const [error, setError] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(
    async (
      nextQuery: string,
      category: string | null,
      page: number,
      append: boolean,
    ): Promise<void> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const requestId = (requestIdRef.current += 1);

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

        // Stale-response guard: drop anything superseded by a newer request.
        if (requestId !== requestIdRef.current) {
          return;
        }

        setCategories(payload.categories);
        setActiveCategory(payload.state.category);
        setPagination(payload.pagination);
        setResults((current) => (append ? [...current, ...payload.data] : payload.data));
        setFocusedId((current) => current ?? payload.data[0]?.item.id ?? null);
        setStatus("success");
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") {
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
      setFocusedId(null);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        await run(value, activeCategory, 1, false);
      }, GLOBAL_SEARCH_DEBOUNCE_MS);
    },
    [activeCategory, run],
  );

  const setCategory = useCallback(
    (name: string | null): void => {
      setActiveCategory(name);
      setFocusedId(null);
      void run(query, name, 1, false);
    },
    [query, run],
  );

  const loadMore = useCallback((): void => {
    if (pagination?.nextPage == null || status === "loading") {
      return;
    }

    void run(query, activeCategory, pagination.nextPage, true);
  }, [activeCategory, pagination, query, run, status]);

  const refreshRecent = useCallback(async (): Promise<void> => {
    try {
      const payload = await apiJson<SearchResponse>(
        buildUrl(endpoint, { recent: "1", per_page: String(perPage) }),
      );
      setRecent(payload.data);
    } catch {
      setRecent([]);
    }
  }, [endpoint, perPage]);

  const openResult = useCallback(
    async (result: SearchResult): Promise<void> => {
      let target = result;

      try {
        const payload = await apiJson<RecordResponse>(endpoint, {
          method: "POST",
          body: JSON.stringify({ category: result.category.name, id: result.item.id }),
          throwOnError: false,
        });
        if (payload.data) {
          target = payload.data;
        }
      } catch {
        // Navigation should still proceed with the row we already have.
      }

      router.visit(target.item.link);
    },
    [endpoint],
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleOpenResult = useCallback(
    (result: SearchResult): void => {
      void openResult(result);
    },
    [openResult],
  );

  const handleRefreshRecent = useCallback((): void => {
    void refreshRecent();
  }, [refreshRecent]);

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
    focusedId,
    setFocusedId,
    loadMore,
    openResult: handleOpenResult,
    refreshRecent: handleRefreshRecent,
  };
}
