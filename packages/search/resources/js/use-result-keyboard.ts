import { useCallback, type KeyboardEvent } from "react";
import { useSearchContext } from "./context";
import type { SearchResult } from "./types";
import { searchResultKey } from "./use-search";

export function searchResultDomId(instanceId: string, result: SearchResult): string {
  return `${instanceId}-result-${encodeURIComponent(searchResultKey(result))}`;
}

export function useResultKeyboard(results: SearchResult[]) {
  const { focusedKey, setFocusedKey, openResult } = useSearchContext();

  return useCallback(
    (event: KeyboardEvent<HTMLElement>): void => {
      if (results.length === 0) {
        return;
      }

      const currentIndex = results.findIndex((result) => searchResultKey(result) === focusedKey);

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const next = results[Math.min(results.length - 1, currentIndex + 1)];
        setFocusedKey(next ? searchResultKey(next) : null);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const previous =
          results[currentIndex < 0 ? results.length - 1 : Math.max(0, currentIndex - 1)];
        setFocusedKey(previous ? searchResultKey(previous) : null);
      } else if (event.key === "Enter") {
        const focused = results[Math.max(0, currentIndex)];

        if (focused) {
          event.preventDefault();
          openResult(focused);
        }
      }
    },
    [focusedKey, openResult, results, setFocusedKey],
  );
}
