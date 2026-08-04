export type DebouncedCallback<A extends unknown[]> = {
  (...args: A): void;
  cancel: () => void;
};
/**
 * A debounced wrapper around `callback` that is stable across renders (it reads
 * the latest callback via a ref) and clears its pending timer on unmount, so a
 * late fire can never run against a torn-down component.
 */
export declare function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delayMs: number,
): DebouncedCallback<A>;
