import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type TreeContextValue = {
  activeId: string | null;
  expanded: Set<string>;
  focus: (id: string) => void;
  focusedId: string | null;
  register: (id: string) => void;
  toggle: (id: string) => void;
  unregister: (id: string) => void;
};

const defaultTreeContext: TreeContextValue = {
  activeId: null,
  expanded: new Set(),
  focus: () => {},
  focusedId: null,
  register: () => {},
  toggle: () => {},
  unregister: () => {},
};

export const TreeContext = createContext<TreeContextValue>(defaultTreeContext);

export function useTreeContext(): TreeContextValue {
  return useContext(TreeContext);
}

function readStoredExpanded(key: string, remember: boolean, fallback: string[]): Set<string> {
  if (!remember || typeof window === "undefined") {
    return new Set(fallback);
  }

  const stored = window.localStorage.getItem(key);

  if (stored === null) {
    return new Set(fallback);
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    return Array.isArray(parsed)
      ? new Set(parsed.filter((id): id is string => typeof id === "string"))
      : new Set(fallback);
  } catch {
    return new Set(fallback);
  }
}

export function useTreeState({
  activeId,
  defaultExpanded,
  rememberState,
  storageKey,
}: {
  activeId: string | null;
  defaultExpanded: string[];
  rememberState: boolean;
  storageKey: string;
}): TreeContextValue {
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    readStoredExpanded(storageKey, rememberState, defaultExpanded),
  );
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const toggle = useCallback(
    (id: string) => {
      setExpanded((current) => {
        const next = new Set(current);

        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        if (rememberState && typeof window !== "undefined") {
          window.localStorage.setItem(storageKey, JSON.stringify([...next]));
        }

        return next;
      });
    },
    [rememberState, storageKey],
  );

  const focus = useCallback((id: string) => setFocusedId(id), []);
  const register = useCallback((): void => {}, []);
  const unregister = useCallback((): void => {}, []);

  return useMemo(
    () => ({ activeId, expanded, focus, focusedId, register, toggle, unregister }),
    [activeId, expanded, focus, focusedId, register, toggle, unregister],
  );
}
