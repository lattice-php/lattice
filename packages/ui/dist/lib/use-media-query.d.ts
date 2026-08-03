/**
 * Track a CSS media query. `fallback` is the SSR / no-`matchMedia` value and the
 * initial state before the effect subscribes.
 */
export declare function useMediaQuery(query: string, fallback?: boolean): boolean;
