import { Dispatch, SetStateAction } from "react";
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
export declare function usePersistentState<T>(
  key: string,
  fallback: T | (() => T),
  options?: PersistentStateOptions<T>,
): [T, Dispatch<SetStateAction<T>>];
