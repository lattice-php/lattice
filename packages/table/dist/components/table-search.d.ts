/**
 * The table-level quick-search box. Keystrokes update the input immediately and
 * commit the term to the server after a short debounce; an externally-changed
 * value (e.g. a filter reset) is adopted without echoing keystroke round-trips.
 */
export declare function TableSearch({ value, onSearch, }: {
    value: string;
    onSearch: (term: string) => void;
}): import("react").JSX.Element;
