import { Icon } from "@lattice-php/lattice/icons";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { useT } from "@lattice-php/lattice/i18n";
import { useGlobalSearchContext } from "../context";

const GlobalSearchInput: RendererComponent<"global-search.input"> = () => {
  const { query, setQuery } = useGlobalSearchContext();
  const { t } = useT("lattice");

  return (
    <div className="flex items-center gap-2 border-b border-lt-border px-3 py-2">
      <Icon name="search" aria-hidden="true" className="size-lt-icon-md text-lt-muted-fg" />
      <input
        autoFocus
        className="w-full bg-transparent text-sm text-lt-fg outline-none placeholder:text-lt-muted-fg"
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("globalSearch.placeholder", "Search…")}
        type="search"
        value={query}
      />
    </div>
  );
};

export default GlobalSearchInput;
