import { useEffect, useState } from "react";

function matches(query: string, fallback: boolean): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return fallback;
  }

  return window.matchMedia(query).matches;
}

/**
 * Track a CSS media query. `fallback` is the SSR / no-`matchMedia` value and the
 * initial state before the effect subscribes.
 */
export function useMediaQuery(query: string, fallback = false): boolean {
  const [state, setState] = useState(() => matches(query, fallback));

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const media = window.matchMedia(query);
    const update = (): void => setState(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [query]);

  return state;
}
