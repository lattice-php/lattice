import { useEffect, useRef, useState } from "react";
import { Icon } from "@lattice-php/lattice/icons";
import { IconButton } from "@lattice-php/lattice/ui/icon-button";
import { Input } from "@lattice-php/lattice/ui/input";
import { useT } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useDebouncedCallback } from "@lattice-php/lattice/lib/use-debounced-callback";

const DEBOUNCE_MS = 300;

/**
 * The table-level quick-search box. Keystrokes update the input immediately and
 * commit the term to the server after a short debounce; an externally-changed
 * value (e.g. a filter reset) is adopted without echoing keystroke round-trips.
 */
export function TableSearch({
  value,
  onSearch,
}: {
  value: string;
  onSearch: (term: string) => void;
}) {
  const { t } = useT("lattice");
  const [term, setTerm] = useState(value);
  const committed = useRef(value);

  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setTerm(value);
    }
  }, [value]);

  function commit(next: string): void {
    committed.current = next;
    onSearch(next);
  }

  const commitDebounced = useDebouncedCallback(commit, DEBOUNCE_MS);

  function change(next: string): void {
    setTerm(next);
    commitDebounced(next);
  }

  function clear(): void {
    commitDebounced.cancel();
    setTerm("");
    commit("");
  }

  const label = t("table.search.placeholder", "Search");

  return (
    <div className="relative w-full max-w-xs">
      <Icon
        name="search"
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 size-lt-icon-sm -translate-y-1/2 text-lt-muted-fg"
      />
      <Input
        type="search"
        data-test="table-search"
        value={term}
        placeholder={label}
        aria-label={label}
        onChange={(event) => change(event.target.value)}
        className={cn("px-8", "[&::-webkit-search-cancel-button]:hidden")}
      />
      {term !== "" && (
        <IconButton
          size="xs"
          icon="x"
          label={t("table.search.clear", "Clear search")}
          data-test="table-search-clear"
          className="absolute right-1.5 top-1/2 -translate-y-1/2"
          onClick={clear}
        />
      )}
    </div>
  );
}
