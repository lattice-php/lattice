import { useCallback, useEffect, useState } from "react";

export function useTableSelection(keys: string[]) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [allMatching, setAllMatching] = useState(false);
  const signature = keys.join(" ");

  useEffect(() => {
    setSelected(new Set());
    setAllMatching(false);
  }, [signature]);

  const toggle = useCallback((key: string): void => {
    setAllMatching(false);
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }, []);

  const toggleAll = useCallback((): void => {
    setAllMatching(false);
    setSelected((current) => (current.size === keys.length ? new Set() : new Set(keys)));
  }, [keys]);

  const selectAllMatching = useCallback((): void => setAllMatching(true), []);

  const clear = useCallback((): void => {
    setAllMatching(false);
    setSelected(new Set());
  }, []);

  const selectedKeys = keys.filter((key) => selected.has(key));
  const allVisibleSelected = keys.length > 0 && selectedKeys.length === keys.length;

  return {
    selectedKeys,
    allMatching,
    allVisibleSelected,
    allSelected: allMatching || allVisibleSelected,
    active: allMatching || selectedKeys.length > 0,
    isSelected: (key: string): boolean => allMatching || selected.has(key),
    toggle,
    toggleAll,
    selectAllMatching,
    clear,
  };
}
