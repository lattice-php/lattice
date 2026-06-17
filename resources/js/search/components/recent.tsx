import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { useT } from "@lattice-php/lattice/i18n";
import { useSearchContext } from "../context";
import { ResultRow } from "./result-row";

const SearchRecent: RendererComponent<"search.recent"> = () => {
  const { query, recent, focusedId, setFocusedId, openResult } = useSearchContext();
  const { t } = useT("lattice");

  if (query.trim() !== "" || recent.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 p-1">
      <span className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-lt-muted-fg">
        {t("search.recent", "Recent")}
      </span>
      {recent.map((result) => (
        <ResultRow
          key={`${result.category.name}:${result.item.id}`}
          focused={result.item.id === focusedId}
          onFocus={() => setFocusedId(result.item.id)}
          onOpen={() => openResult(result)}
          result={result}
        />
      ))}
    </div>
  );
};

export default SearchRecent;
