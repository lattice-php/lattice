import { useEffect, useRef, useState } from "react";
import { DataTableSearch } from "@lattice-php/table/primitives/data-table";
import { useT } from "@lattice-php/ui/i18n";
import { useDebouncedCallback } from "@lattice-php/ui/lib/use-debounced-callback";

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

  return (
    <DataTableSearch
      clearButtonProps={{ "data-test": "table-search-clear" }}
      clearLabel={t("table.search.clear", "Clear search")}
      data-test="table-search"
      onClear={clear}
      onValueChange={change}
      placeholder={t("table.search.placeholder", "Search")}
      value={term}
    />
  );
}
