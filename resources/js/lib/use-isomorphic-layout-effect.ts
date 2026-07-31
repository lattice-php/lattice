import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` warns under `renderToString`; effects never run there, so
 * the server-side substitution is free.
 */
export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
