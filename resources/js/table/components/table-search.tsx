import { useEffect, useRef, useState } from "react";
import { Icon } from "@lattice-php/lattice/icons";
import { Input } from "@lattice-php/lattice/ui/input";
import { useT } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";

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
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const committed = useRef(value);

  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setTerm(value);
    }
  }, [value]);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  function commit(next: string): void {
    committed.current = next;
    onSearch(next);
  }

  function change(next: string): void {
    setTerm(next);

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => commit(next), DEBOUNCE_MS);
  }

  function clear(): void {
    if (timer.current) {
      clearTimeout(timer.current);
    }

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
        <button
          type="button"
          data-test="table-search-clear"
          aria-label={t("table.search.clear", "Clear search")}
          onClick={clear}
          className="absolute right-1.5 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-lt-sm text-lt-muted-fg hover:bg-lt-muted hover:text-lt-fg"
        >
          <Icon name="x" aria-hidden="true" className="size-lt-icon-sm" />
        </button>
      )}
    </div>
  );
}
