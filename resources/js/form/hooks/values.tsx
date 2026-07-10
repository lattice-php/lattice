import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { getPath, setPath } from "../lib/form-path";

export type SetFormValue = (
  name: string,
  value: unknown | ((previous: unknown) => unknown),
) => void;

type FormValuesStore = {
  getPathSnapshot: (path: string) => unknown;
  getPathsSnapshot: (paths: string[]) => Record<string, unknown>;
  getSnapshot: () => Record<string, unknown>;
  replaceInitial: (initial: Record<string, unknown>) => void;
  setValue: SetFormValue;
  subscribe: (listener: () => void) => () => void;
  subscribePath: (path: string, listener: () => void) => () => void;
  subscribePaths: (paths: string[], listener: () => void) => () => void;
};

const emptyValues: Record<string, unknown> = {};
const emptySelectedValues: Record<string, unknown> = {};

const FormValuesStoreContext = createContext<FormValuesStore | null>(null);
const SetFormValueContext = createContext<SetFormValue>(() => {});

function valuesEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (!a || !b || typeof a !== "object" || typeof b !== "object") {
    return false;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((value, index) => valuesEqual(value, b[index]))
    );
  }

  const aEntries = Object.entries(a);
  const bObject = b as Record<string, unknown>;

  return (
    aEntries.length === Object.keys(bObject).length &&
    aEntries.every(([key, value]) => valuesEqual(value, bObject[key]))
  );
}

function normalizePath(path: string): string {
  return path
    .split(".")
    .filter((part) => part !== "")
    .join(".");
}

function pathsOverlap(left: string, right: string): boolean {
  return (
    left === "" ||
    right === "" ||
    left === right ||
    left.startsWith(`${right}.`) ||
    right.startsWith(`${left}.`)
  );
}

function createFormValuesStore(initial: Record<string, unknown>): FormValuesStore {
  let initialValues = initial;
  let values = initial;
  const listeners = new Set<() => void>();
  const pathListeners = new Map<string, Set<() => void>>();
  const selectedCache = new Map<string, { snapshot: Record<string, unknown>; values: unknown[] }>();

  const notify = (path: string): void => {
    for (const listener of listeners) {
      listener();
    }

    const normalizedPath = normalizePath(path);

    for (const [subscribedPath, subscribedListeners] of pathListeners) {
      if (!pathsOverlap(subscribedPath, normalizedPath)) {
        continue;
      }

      for (const listener of subscribedListeners) {
        listener();
      }
    }
  };

  const updateValues = (next: Record<string, unknown>, path: string): void => {
    if (Object.is(values, next)) {
      return;
    }

    values = next;
    selectedCache.clear();
    notify(path);
  };

  const subscribePath = (path: string, listener: () => void): (() => void) => {
    const normalizedPath = normalizePath(path);
    const listenersForPath = pathListeners.get(normalizedPath) ?? new Set<() => void>();

    listenersForPath.add(listener);
    pathListeners.set(normalizedPath, listenersForPath);

    return () => {
      listenersForPath.delete(listener);

      if (listenersForPath.size === 0) {
        pathListeners.delete(normalizedPath);
      }
    };
  };

  return {
    getPathSnapshot: (path: string): unknown => getPath(values, path),
    getPathsSnapshot: (paths: string[]): Record<string, unknown> => {
      if (paths.length === 0) {
        return emptySelectedValues;
      }

      const normalizedPaths = paths.map(normalizePath);
      const key = JSON.stringify(paths);
      const selectedValues = normalizedPaths.map((path) => getPath(values, path));
      const cached = selectedCache.get(key);

      if (
        cached &&
        cached.values.length === selectedValues.length &&
        selectedValues.every((value, index) => Object.is(value, cached.values[index]))
      ) {
        return cached.snapshot;
      }

      const snapshot = Object.fromEntries(
        paths.map((path, index) => [path, selectedValues[index]]),
      );

      selectedCache.set(key, { snapshot, values: selectedValues });

      return snapshot;
    },
    getSnapshot: () => values,
    replaceInitial: (nextInitial: Record<string, unknown>): void => {
      if (valuesEqual(initialValues, nextInitial)) {
        return;
      }

      initialValues = nextInitial;
      updateValues(nextInitial, "");
    },
    setValue: (name: string, value: unknown | ((previous: unknown) => unknown)): void => {
      const previous = getPath(values, name);
      const next = typeof value === "function" ? value(previous) : value;

      if (Object.is(previous, next)) {
        return;
      }

      updateValues(setPath(values, name, next), name);
    },
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    subscribePath,
    subscribePaths: (paths: string[], listener: () => void): (() => void) => {
      const unsubscribers = Array.from(new Set(paths.map(normalizePath))).map((path) =>
        subscribePath(path, listener),
      );

      return () => {
        for (const unsubscribe of unsubscribers) {
          unsubscribe();
        }
      };
    },
  };
}

const fallbackFormValuesStore = createFormValuesStore(emptyValues);

export function FormValuesProvider({
  initial,
  children,
}: {
  initial: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const storeRef = useRef<FormValuesStore>(null);

  if (storeRef.current === null) {
    storeRef.current = createFormValuesStore(initial);
  }

  useEffect(() => {
    storeRef.current?.replaceInitial(initial);
  }, [initial]);

  return (
    <FormValuesStoreContext.Provider value={storeRef.current}>
      <SetFormValueContext.Provider value={storeRef.current.setValue}>
        {children}
      </SetFormValueContext.Provider>
    </FormValuesStoreContext.Provider>
  );
}

function useFormValuesStore(): FormValuesStore {
  return useContext(FormValuesStoreContext) ?? fallbackFormValuesStore;
}

export function useFormValues(): Record<string, unknown> {
  const store = useFormValuesStore();

  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

export function useFormValue(name: string): unknown {
  const store = useFormValuesStore();
  const subscribe = useCallback(
    (listener: () => void) => store.subscribePath(name, listener),
    [name, store],
  );
  const getSnapshot = useCallback(() => store.getPathSnapshot(name), [name, store]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useFormValuesFor(paths: string[]): Record<string, unknown> {
  const store = useFormValuesStore();
  const pathsKey = JSON.stringify(paths);
  const selectedPaths = useMemo(() => JSON.parse(pathsKey) as string[], [pathsKey]);
  const subscribe = useCallback(
    (listener: () => void) => store.subscribePaths(selectedPaths, listener),
    [selectedPaths, store],
  );
  const getSnapshot = useCallback(
    () => store.getPathsSnapshot(selectedPaths),
    [selectedPaths, store],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useSetFormValue(): SetFormValue {
  return useContext(SetFormValueContext);
}
