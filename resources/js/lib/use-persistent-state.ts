import type { Dispatch, SetStateAction } from "react";
import { useCallback, useRef, useState } from "react";

export type PersistentStateOptions<T> = {
  enabled?: boolean;
  parse?: (raw: string) => T;
  serialize?: (value: T) => string | null;
};

/**
 * `useState` backed by `localStorage`. The SSR guard and read/write `try/catch`
 * live here once; `parse`/`serialize` default to JSON. Persistence happens in
 * the setter (not inside the state updater), so a StrictMode double-invoke never
 * double-writes, and a `serialize` returning `null` removes the key.
 */
export function usePersistentState<T>(
  key: string,
  fallback: T | (() => T),
  options: PersistentStateOptions<T> = {},
): [T, Dispatch<SetStateAction<T>>] {
  const { enabled = true, parse, serialize } = options;

  const resolveFallback = (): T =>
    typeof fallback === "function" ? (fallback as () => T)() : fallback;

  const [value, setValue] = useState<T>(() => {
    if (!enabled || typeof window === "undefined") {
      return resolveFallback();
    }

    let raw: string | null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return resolveFallback();
    }

    if (raw === null) {
      return resolveFallback();
    }

    try {
      return parse ? parse(raw) : (JSON.parse(raw) as T);
    } catch {
      // Drop corrupt data so it cannot resurface on the next read.
      try {
        window.localStorage.removeItem(key);
      } catch {
        return resolveFallback();
      }

      return resolveFallback();
    }
  });

  const valueRef = useRef(value);
  valueRef.current = value;

  const persistRef = useRef({ enabled, key, serialize });
  persistRef.current = { enabled, key, serialize };

  const setPersistentValue = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    const next =
      typeof action === "function" ? (action as (prev: T) => T)(valueRef.current) : action;

    valueRef.current = next;
    setValue(next);

    const { enabled: on, key: storageKey, serialize: encode } = persistRef.current;

    if (!on || typeof window === "undefined") {
      return;
    }

    try {
      const encoded = encode ? encode(next) : JSON.stringify(next);

      if (encoded === null) {
        window.localStorage.removeItem(storageKey);
      } else {
        window.localStorage.setItem(storageKey, encoded);
      }
    } catch {
      return;
    }
  }, []);

  return [value, setPersistentValue];
}
