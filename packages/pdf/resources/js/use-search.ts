import { useEffect, useMemo, useState } from "react";
import { findPageMatches } from "./search";
import type { SearchMatch } from "./search";
import type { PageTextCache } from "./text-cache";

const SEARCH_DEBOUNCE_MS = 250;

export type SearchState = {
  query: string;
  setQuery(query: string): void;
  matches: SearchMatch[];
  currentIndex: number;
  currentMatch: SearchMatch | null;
  next(): void;
  previous(): void;
  matchesForPage(page: number): SearchMatch[];
};

export function useSearch(textCache: PageTextCache | null): SearchState {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    if (!textCache || query.trim() === "") {
      setMatches([]);
      setCurrentIndex(-1);

      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      void (async () => {
        const found: SearchMatch[] = [];

        for (let page = 1; page <= textCache.numPages; page += 1) {
          const { items } = await textCache.get(page);

          if (cancelled) {
            return;
          }

          found.push(...findPageMatches(items, page, query));
        }

        setMatches(found);
        setCurrentIndex(found.length > 0 ? 0 : -1);
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, textCache]);

  const byPage = useMemo(() => {
    const map = new Map<number, SearchMatch[]>();

    for (const match of matches) {
      const list = map.get(match.page) ?? [];
      list.push(match);
      map.set(match.page, list);
    }

    return map;
  }, [matches]);

  return {
    query,
    setQuery,
    matches,
    currentIndex,
    currentMatch: currentIndex >= 0 ? (matches[currentIndex] ?? null) : null,
    next() {
      setCurrentIndex((index) => (matches.length === 0 ? -1 : (index + 1) % matches.length));
    },
    previous() {
      setCurrentIndex((index) =>
        matches.length === 0 ? -1 : (index - 1 + matches.length) % matches.length,
      );
    },
    matchesForPage(page: number): SearchMatch[] {
      return byPage.get(page) ?? [];
    },
  };
}
