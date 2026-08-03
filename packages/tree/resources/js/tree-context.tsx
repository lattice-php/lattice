import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RefObject } from "react";
import { apiJson, usePersistentState } from "@lattice-php/lattice/runtime";
import type { TreeNodeData } from "./tree";

export const ROOTS_KEY = "";

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
  canLoad: boolean;
  childrenFor: (id: string) => TreeNodeData[] | undefined;
  expanded: Set<string>;
  focus: (id: string) => void;
  focusedId: string | null;
  isLoading: (id: string) => boolean;
  loadChildren: (id: string) => void;
  moveFocus: (fromId: string, direction: TreeFocusDirection) => void;
  register: (entry: TreeItemRegistration) => void;
  toggle: (id: string) => void;
  typeAhead: (fromId: string, character: string) => void;
  unregister: (path: string) => void;
};

const defaultTreeContext: TreeContextValue = {
  activate: () => {},
  activeId: null,
  canLoad: false,
  childrenFor: () => undefined,
  expanded: new Set(),
  focus: () => {},
  focusedId: null,
  isLoading: () => false,
  loadChildren: () => {},
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
  endpoint,
  componentRef,
  lazy,
  nodes,
  rememberState,
  storageKey,
}: {
  activeId: string | null;
  defaultExpanded: string[];
  endpoint: string | null;
  componentRef: string | null;
  lazy: boolean;
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
  const [loaded, setLoaded] = useState<Map<string, TreeNodeData[]>>(new Map());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const inFlightRef = useRef<Set<string>>(new Set());
  const loadedRef = useRef(loaded);
  loadedRef.current = loaded;
  const canLoad = endpoint !== null && endpoint !== "";

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

  const loadChildren = useCallback(
    (id: string) => {
      if (!canLoad || inFlightRef.current.has(id) || loadedRef.current.has(id)) {
        return;
      }

      inFlightRef.current.add(id);
      setLoading((current) => new Set(current).add(id));

      apiJson<{ nodes: TreeNodeData[] }>(`${endpoint}?parent=${encodeURIComponent(id)}`, {
        ref: componentRef ?? "",
      })
        .then(({ nodes: fetched }) => {
          setLoaded((current) => new Map(current).set(id, fetched));
        })
        .catch(() => {
          // Collapse so the next expand retries; nothing is cached for the id.
          setExpanded((current) => {
            const next = new Set(current);
            next.delete(id);

            return next;
          });
        })
        .finally(() => {
          inFlightRef.current.delete(id);
          setLoading((current) => {
            const next = new Set(current);
            next.delete(id);

            return next;
          });
        });
    },
    [canLoad, componentRef, endpoint, setExpanded],
  );

  const childrenFor = useCallback((id: string) => loaded.get(id), [loaded]);

  const isLoading = useCallback((id: string) => loading.has(id), [loading]);

  const hasWireNodes = nodes.length > 0;

  useEffect(() => {
    if (lazy && !hasWireNodes) {
      loadChildren(ROOTS_KEY);
    }
  }, [lazy, hasWireNodes, loadChildren]);

  const firstFetchedRootId = loaded.get(ROOTS_KEY)?.[0]?.id;

  useEffect(() => {
    if (focusedId === null && firstFetchedRootId !== undefined) {
      setFocusedId(firstFetchedRootId);
    }
  }, [focusedId, firstFetchedRootId]);

  return useMemo(
    () => ({
      activate,
      activeId,
      canLoad,
      childrenFor,
      expanded,
      focus,
      focusedId,
      isLoading,
      loadChildren,
      moveFocus,
      register,
      toggle,
      typeAhead,
      unregister,
    }),
    [
      activate,
      activeId,
      canLoad,
      childrenFor,
      expanded,
      focus,
      focusedId,
      isLoading,
      loadChildren,
      moveFocus,
      register,
      toggle,
      typeAhead,
      unregister,
    ],
  );
}
