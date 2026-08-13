import { useEffect, useRef } from "react";
import type { RendererComponent } from "@lattice-php/core/types";
import { useT } from "@lattice-php/ui/i18n";
import { useSearchContext } from "../context";
import { searchResultDomId, useResultKeyboard } from "../use-result-keyboard";
import { searchResultKey } from "../use-search";
import { ResultRow } from "./result-row";

const SearchResults: RendererComponent<"search.results"> = () => {
  const {
    query,
    results,
    recent,
    focusedKey,
    setFocusedKey,
    openResult,
    loadMore,
    status,
    pagination,
    instanceId,
  } = useSearchContext();
  const { t } = useT("search");
  const loadMoreRef = useRef<HTMLButtonElement | null>(null);
  const navigate = useResultKeyboard(results);

  useEffect(() => {
    const button = loadMoreRef.current;

    if (button === null || pagination?.hasMore !== true || !window.IntersectionObserver) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMore();
      }
    });
    observer.observe(button);

    return () => observer.disconnect();
  }, [loadMore, pagination?.hasMore]);

  if (status === "error") {
    return (
      <div className="p-4 text-sm text-lt-danger">{t("search.error", "Something went wrong.")}</div>
    );
  }

  if (status === "loading" && results.length === 0) {
    return <div className="p-4 text-sm text-lt-muted-fg">{t("search.loading", "Searching…")}</div>;
  }

  if (results.length === 0) {
    return query.trim() === "" && recent.length > 0 ? null : (
      <div className="p-4 text-sm text-lt-muted-fg">{t("search.empty", "No results found.")}</div>
    );
  }

  return (
    <div
      aria-activedescendant={
        focusedKey ? `${instanceId}-result-${encodeURIComponent(focusedKey)}` : undefined
      }
      aria-label={t("search.results", "Results")}
      className="flex h-full flex-col gap-1 overflow-y-auto p-1 outline-none"
      onKeyDown={navigate}
      role="listbox"
      tabIndex={0}
      id={`${instanceId}-results`}
    >
      {results.map((result) => {
        const key = searchResultKey(result);

        return (
          <ResultRow
            key={key}
            focused={key === focusedKey}
            id={searchResultDomId(instanceId, result)}
            onFocus={() => setFocusedKey(key)}
            onOpen={() => openResult(result)}
            result={result}
          />
        );
      })}
      {pagination?.hasMore ? (
        <button
          ref={loadMoreRef}
          className="min-h-11 rounded-lt-sm px-3 text-sm text-lt-muted-fg hover:bg-lt-muted/60"
          disabled={status === "loading"}
          onClick={loadMore}
          type="button"
        >
          {status === "loading"
            ? t("search.loading", "Searching…")
            : t("search.load-more", "Load more")}
        </button>
      ) : null}
    </div>
  );
};

export default SearchResults;
