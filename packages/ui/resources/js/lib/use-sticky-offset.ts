import { useRef } from "react";
import type { RefObject } from "react";
import { useLayoutEffect } from "./use-layout-effect";

/**
 * The distance from the viewport top that sticky content must leave free for
 * the sticky chrome above it. The stylesheet seeds it (0, or the topbar height
 * when the topbar is sticky); a sticky stack republishes it for its siblings.
 */
export const STICKY_OFFSET_VAR = "--lt-sticky-offset";

/**
 * The offset a sticky stack itself pins to. It is frozen per element because
 * the stack overrides the shared variable on its parent, which would otherwise
 * feed back into its own `top`.
 */
export const STICKY_OWN_TOP_VAR = "--lt-sticky-own-top";

/**
 * Pins an element below the sticky chrome above it and publishes the element's
 * own height, added to that chrome, as the sticky offset for its siblings.
 */
export function useStickyOffsetPublisher(enabled: boolean): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    const parent = element?.parentElement;

    if (!enabled || !element || !parent || typeof ResizeObserver === "undefined") {
      return;
    }

    const base = inheritedOffset(parent.parentElement);
    element.style.setProperty(STICKY_OWN_TOP_VAR, base);

    const publish = (): void => {
      parent.style.setProperty(STICKY_OFFSET_VAR, `calc(${base} + ${element.offsetHeight}px)`);
    };

    publish();

    const observer = new ResizeObserver(publish);
    observer.observe(element);

    return () => {
      observer.disconnect();
      parent.style.removeProperty(STICKY_OFFSET_VAR);
      element.style.removeProperty(STICKY_OWN_TOP_VAR);
    };
  }, [enabled]);

  return ref;
}

function inheritedOffset(element: HTMLElement | null): string {
  if (!element) {
    return "0px";
  }

  return getComputedStyle(element).getPropertyValue(STICKY_OFFSET_VAR).trim() || "0px";
}
