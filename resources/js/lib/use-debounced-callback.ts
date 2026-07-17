import { useCallback, useEffect, useMemo, useRef } from "react";

export type DebouncedCallback<A extends unknown[]> = {
  (...args: A): void;
  cancel: () => void;
};

/**
 * A debounced wrapper around `callback` that is stable across renders (it reads
 * the latest callback via a ref) and clears its pending timer on unmount, so a
 * late fire can never run against a torn-down component.
 */
export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delayMs: number,
): DebouncedCallback<A> {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  return useMemo(() => {
    const debounced = (...args: A): void => {
      cancel();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        callbackRef.current(...args);
      }, delayMs);
    };

    debounced.cancel = cancel;

    return debounced;
  }, [cancel, delayMs]);
}
