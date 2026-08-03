import { useEffect } from "react";
/**
 * Drop-in for React's `useLayoutEffect`, which warns under `renderToString`;
 * effects never run there, so the server-side substitution is free.
 */
export declare const useLayoutEffect: typeof useEffect;
