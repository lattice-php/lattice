import { useT } from "@lattice-php/ui/i18n";
import { useSearchContext } from "../../context";
import { searchResultDomId, useResultKeyboard } from "../../use-result-keyboard";
import { searchResultKey } from "../../use-search";
import { ResultRow } from "../../primitives/result-row";

export type SearchRecentProps = {
  "data-test"?: string;
};

export function SearchRecent({ "data-test": testId }: SearchRecentProps = {}) {
  const { query, results, recent, focusedKey, setFocusedKey, openResult, instanceId } =
    useSearchContext();
  const { t } = useT("search");
  const navigate = useResultKeyboard(recent);

  if (query.trim() !== "" || results.length > 0 || recent.length === 0) {
    return null;
  }

  return (
    <div
      data-test={testId}
      aria-label={t("search.recent", "Recent")}
      className="flex max-h-full flex-col gap-1 overflow-y-auto p-1"
      id={`${instanceId}-recent`}
      onKeyDown={navigate}
      role="listbox"
    >
      <span className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-lt-muted-fg">
        {t("search.recent", "Recent")}
      </span>
      {recent.map((result) => {
        const key = searchResultKey(result);

        return (
          <ResultRow
            key={key}
            focused={key === focusedKey}
            id={searchResultDomId(instanceId, result)}
            onFocus={() => setFocusedKey(key)}
            onOpen={() => openResult(result)}
            result={result}
            tabIndex={0}
          />
        );
      })}
    </div>
  );
}
