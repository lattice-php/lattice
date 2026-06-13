import { useLayoutEffect, useRef } from "react";

const DURATION_MS = 180;

function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * FLIP reorder: animates registered elements from their previous to current
 * position whenever `orderSignature` changes. Imperative style writes only, so
 * it does not affect React render or the memoised rows.
 */
export function useFlipReorder(
  orderSignature: string,
): (key: string, el: HTMLElement | null) => void {
  const elements = useRef(new Map<string, HTMLElement>());
  const previous = useRef(new Map<string, DOMRect>());

  // register is the FLIP measurement target; the element must be a zero-overhead positioning wrapper (no padding/margin) for the delta to match the visible row.
  const register = (key: string, el: HTMLElement | null): void => {
    if (el) {
      elements.current.set(key, el);
    } else {
      elements.current.delete(key);
    }
  };

  useLayoutEffect(() => {
    const handles: number[] = [];
    const next = new Map<string, DOMRect>();
    elements.current.forEach((el, key) => {
      el.style.transition = "";
      el.style.transform = "";
      next.set(key, el.getBoundingClientRect());
    });

    if (!prefersReducedMotion()) {
      elements.current.forEach((el, key) => {
        const before = previous.current.get(key);
        const after = next.get(key);
        if (before && after) {
          const dy = before.top - after.top;
          if (dy) {
            el.style.transform = `translateY(${dy}px)`;
            handles.push(
              requestAnimationFrame(() => {
                el.style.transition = `transform ${DURATION_MS}ms ease-out`;
                el.style.transform = "";
              }),
            );
          }
        }
      });
    }

    previous.current = next;

    return () => {
      for (const handle of handles) {
        cancelAnimationFrame(handle);
      }
    };
  }, [orderSignature]);

  return register;
}
