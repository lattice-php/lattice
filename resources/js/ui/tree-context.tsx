import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { usePersistentState } from "@lattice-php/lattice/lib/use-persistent-state";

export type TreeItemRegistration = {
  id: string;
  label: string;
  orderPath: string;
  parentPath: string | null;
  path: string;
  ref: RefObject<HTMLLIElement | null>;
};

export type TreeFocusDirection = "first" | "firstChild" | "last" | "next" | "parent" | "prev";

export type TreeContextValue = {
  activate: (id: string) => void;
  activeId: string | null;
  expanded: Set<string>;
  focus: (id: string) => void;
  focusedId: string | null;
  moveFocus: (fromId: string, direction: TreeFocusDirection) => void;
  register: (entry: TreeItemRegistration) => void;
  toggle: (id: string) => void;
  typeAhead: (fromId: string, character: string) => void;
  unregister: (path: string) => void;
};

const defaultTreeContext: TreeContextValue = {
  activate: () => {},
  activeId: null,
  expanded: new Set(),
  focus: () => {},
  focusedId: null,
  moveFocus: () => {},
  register: () => {},
  toggle: () => {},
  typeAhead: () => {},
  unregister: () => {},
};

export const TreeContext = createContext<TreeContextValue>(defaultTreeContext);

export function useTreeContext(): TreeContextValue {
  return useContext(TreeContext);
}

function parseExpanded(raw: string): Set<string> {
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("expected an array of ids");
  }

  return new Set(parsed.filter((id): id is string => typeof id === "string"));
}

function visibleOrder(registry: Map<string, TreeItemRegistration>): TreeItemRegistration[] {
  return [...registry.values()].sort((a, b) => a.orderPath.localeCompare(b.orderPath));
}

const TYPEAHEAD_IDLE_MS = 800;

export function useTreeState({
  activeId: initialActiveId,
  defaultExpanded,
  nodes,
  rememberState,
  storageKey,
}: {
  activeId: string | null;
  defaultExpanded: string[];
  nodes: Array<{ id: string }>;
  rememberState: boolean;
  storageKey: string;
}): TreeContextValue {
  const [expanded, setExpanded] = usePersistentState<Set<string>>(
    storageKey,
    () => new Set(defaultExpanded),
    {
      enabled: rememberState,
      parse: parseExpanded,
      serialize: (value) => JSON.stringify([...value]),
    },
  );
  const [activeId, setActiveId] = useState<string | null>(initialActiveId);
  const [focusedId, setFocusedId] = useState<string | null>(() => nodes[0]?.id ?? null);
  const registryRef = useRef<Map<string, TreeItemRegistration>>(new Map());
  const typeAheadRef = useRef<{ text: string; timestamp: number }>({ text: "", timestamp: 0 });

  const toggle = useCallback(
    (id: string) => {
      setExpanded((current) => {
        const next = new Set(current);

        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        return next;
      });
    },
    [setExpanded],
  );

  const activate = useCallback((id: string) => setActiveId(id), []);

  const focus = useCallback((id: string) => {
    setFocusedId(id);
    const entry = [...registryRef.current.values()].find((candidate) => candidate.id === id);
    entry?.ref.current?.focus();
  }, []);

  const register = useCallback((entry: TreeItemRegistration) => {
    registryRef.current.set(entry.path, entry);
  }, []);

  const unregister = useCallback((path: string) => {
    registryRef.current.delete(path);
  }, []);

  const moveFocus = useCallback(
    (fromId: string, direction: TreeFocusDirection) => {
      const order = visibleOrder(registryRef.current);

      if (order.length === 0) {
        return;
      }

      const index = order.findIndex((entry) => entry.id === fromId);
      const current = index === -1 ? undefined : order[index];

      let target: TreeItemRegistration | undefined;

      switch (direction) {
        case "next":
          target = index === -1 ? undefined : order[index + 1];
          break;
        case "prev":
          target = index === -1 ? undefined : order[index - 1];
          break;
        case "first":
          target = order[0];
          break;
        case "last":
          target = order[order.length - 1];
          break;
        case "parent":
          target = current ? order.find((entry) => entry.path === current.parentPath) : undefined;
          break;
        case "firstChild":
          target = current ? order.find((entry) => entry.parentPath === current.path) : undefined;
          break;
      }

      if (target) {
        focus(target.id);
      }
    },
    [focus],
  );

  const typeAhead = useCallback(
    (fromId: string, character: string) => {
      const order = visibleOrder(registryRef.current);

      if (order.length === 0) {
        return;
      }

      const now = Date.now();
      const buffer = typeAheadRef.current;
      const text = now - buffer.timestamp > TYPEAHEAD_IDLE_MS ? character : buffer.text + character;
      typeAheadRef.current = { text, timestamp: now };

      const needle = text.toLowerCase();
      const startIndex = order.findIndex((entry) => entry.id === fromId);
      const start = startIndex === -1 ? 0 : startIndex;

      for (let offset = 1; offset <= order.length; offset++) {
        const candidate = order[(start + offset) % order.length];

        if (candidate.label.toLowerCase().startsWith(needle)) {
          focus(candidate.id);
          return;
        }
      }
    },
    [focus],
  );

  return useMemo(
    () => ({
      activate,
      activeId,
      expanded,
      focus,
      focusedId,
      moveFocus,
      register,
      toggle,
      typeAhead,
      unregister,
    }),
    [
      activate,
      activeId,
      expanded,
      focus,
      focusedId,
      moveFocus,
      register,
      toggle,
      typeAhead,
      unregister,
    ],
  );
}
