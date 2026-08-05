import { useCallback, useState } from "react";

/**
 * Client-side expansion state for expandable table rows, keyed by row key.
 * In-memory only: expansions reset when the table reloads or refetches.
 */
export function useExpandedRows() {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());

  const isExpanded = useCallback((key: string): boolean => expanded.has(key), [expanded]);

  const toggle = useCallback((key: string): void => {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }, []);

  return { isExpanded, toggle };
}
