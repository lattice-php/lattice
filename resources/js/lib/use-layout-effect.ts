// oxlint-disable-next-line no-restricted-imports -- the one place the real hook may be imported
import { useEffect, useLayoutEffect as reactUseLayoutEffect } from "react";

/**
 * Drop-in for React's `useLayoutEffect`, which warns under `renderToString`;
 * effects never run there, so the server-side substitution is free. Lint bans
 * the React import — always import the hook from here.
 */
export const useLayoutEffect = typeof window === "undefined" ? useEffect : reactUseLayoutEffect;
