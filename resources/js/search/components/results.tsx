import { useEffect, useRef, type KeyboardEvent } from "react";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { useT } from "@lattice-php/lattice/i18n";
import { useSearchContext } from "../context";
import { ResultRow } from "./result-row";

const SearchResults: RendererComponent<"search.results"> = () => {
  const { results, focusedId, setFocusedId, openResult, loadMore, status, pagination } =
    useSearchContext();
  const { t } = useT("lattice");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || pagination?.hasMore !== true) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMore();
      }
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, [loadMore, pagination?.hasMore]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (results.length === 0) {
      return;
    }

    const index = Math.max(
      0,
      results.findIndex((result) => result.item.id === focusedId),
    );

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedId(results[Math.min(results.length - 1, index + 1)]?.item.id ?? null);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedId(results[Math.max(0, index - 1)]?.item.id ?? null);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const focused = results[index];
      if (focused) {
        openResult(focused);
      }
    }
  }

  if (status === "error") {
    return (
      <div className="p-4 text-sm text-lt-danger">{t("search.error", "Something went wrong.")}</div>
    );
  }

  if (status === "loading" && results.length === 0) {
    return <div className="p-4 text-sm text-lt-muted-fg">{t("search.loading", "Searching…")}</div>;
  }

  if (results.length === 0) {
    return (
      <div className="p-4 text-sm text-lt-muted-fg">{t("search.empty", "No results found.")}</div>
    );
  }

  return (
    <div
      aria-label={t("search.results", "Results")}
      className="flex flex-col gap-1 overflow-y-auto p-1 outline-none"
      onKeyDown={onKeyDown}
      role="listbox"
      tabIndex={0}
    >
      {results.map((result) => (
        <ResultRow
          key={`${result.category.name}:${result.item.id}`}
          focused={result.item.id === focusedId}
          onFocus={() => setFocusedId(result.item.id)}
          onOpen={() => openResult(result)}
          result={result}
        />
      ))}
      <div ref={sentinelRef} aria-hidden="true" />
    </div>
  );
};

export default SearchResults;
