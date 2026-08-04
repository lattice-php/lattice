/**
 * Client-side expansion state for expandable table rows, keyed by row key.
 * In-memory only: expansions reset when the table reloads or refetches.
 */
export declare function useExpandedRows(): {
    isExpanded: (key: string) => boolean;
    toggle: (key: string) => void;
};
