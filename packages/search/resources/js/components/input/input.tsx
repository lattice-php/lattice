import { Icon } from "@lattice-php/ui/icons";
import { useSearchContext } from "../../context";
import { searchResultDomId, useResultKeyboard } from "../../use-result-keyboard";
import { searchResultKey } from "../../use-search";

export type SearchInputProps = {
  "data-test"?: string;
};

export function SearchInput({ "data-test": testId }: SearchInputProps = {}) {
  const { placeholder, query, setQuery, results, recent, focusedKey, instanceId } =
    useSearchContext();
  const displayedResults = results.length > 0 ? results : query.trim() === "" ? recent : [];
  const navigate = useResultKeyboard(displayedResults);
  const focused = displayedResults.find((result) => searchResultKey(result) === focusedKey);

  return (
    <div
      data-test={testId}
      className="flex min-h-12 items-center gap-2 border-b border-lt-border px-4"
    >
      <Icon name="search" aria-hidden="true" className="size-lt-icon-md text-lt-muted-fg" />
      <input
        aria-activedescendant={focused ? searchResultDomId(instanceId, focused) : undefined}
        aria-controls={
          displayedResults.length > 0
            ? `${instanceId}-${results.length > 0 ? "results" : "recent"}`
            : undefined
        }
        aria-label={placeholder}
        autoFocus
        className="min-h-11 w-full bg-transparent text-sm text-lt-fg outline-none placeholder:text-lt-muted-fg"
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={navigate}
        placeholder={placeholder}
        type="search"
        value={query}
      />
    </div>
  );
}
