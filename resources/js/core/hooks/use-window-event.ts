import { useEffect, useRef } from "react";

/**
 * Subscribe to a window event for the lifetime of the component. The handler is
 * read through a ref, so a fresh handler each render never re-subscribes; pass
 * `enabled: false` to detach without unmounting.
 */
export function useWindowEvent(
  type: string,
  handler: (event: Event) => void,
  options: { enabled?: boolean } = {},
): void {
  const { enabled = true } = options;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const listener = (event: Event): void => handlerRef.current(event);

    window.addEventListener(type, listener);

    return () => window.removeEventListener(type, listener);
  }, [type, enabled]);
}
