import { usePage } from "@inertiajs/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { CollapsedContext } from "../core/collapsed-context";
import { cn } from "@lattice-php/lattice/lib/utils";

function viewportOffset(rect: DOMRect, margin: number): { left: number; top: number } {
  let left = 0;
  let top = 0;

  if (rect.right > window.innerWidth - margin) {
    left = window.innerWidth - margin - rect.right;
  }
  if (rect.left + left < margin) {
    left = margin - rect.left;
  }
  if (rect.bottom > window.innerHeight - margin) {
    top = window.innerHeight - margin - rect.bottom;
  }
  if (rect.top + top < margin) {
    top = margin - rect.top;
  }

  return { left, top };
}

export function Popover({
  align = "start",
  children,
  className,
  placement = "bottom",
  testId,
  trigger,
  triggerClassName,
  triggerLabel,
}: {
  align?: "start" | "end";
  children: ReactNode;
  className?: string;
  placement?: "bottom" | "right" | "top";
  testId?: string;
  trigger: ReactNode;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const url = usePage().url;

  useEffect(() => setOpen(false), [url]);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!open || !menu) {
      return;
    }

    const rect = menu.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return;
    }

    const offset = viewportOffset(rect, 8);

    if (offset.left !== 0 || offset.top !== 0) {
      setPosition((current) => ({
        left: current.left + offset.left,
        top: current.top + offset.top,
      }));
    }
  }, [open]);

  function toggle(): void {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition(
        placement === "right"
          ? { left: rect.right + 4, top: rect.top }
          : {
              left: align === "end" ? rect.right : rect.left,
              top: placement === "top" ? rect.top - 4 : rect.bottom + 4,
            },
      );
    }
    setOpen((value) => !value);
  }

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={triggerLabel}
        className={cn("w-full", triggerClassName)}
        data-test={testId}
        onClick={toggle}
        ref={triggerRef}
        title={triggerLabel}
        type="button"
      >
        {trigger}
      </button>
      {open
        ? createPortal(
            <>
              <button
                aria-hidden="true"
                className="fixed inset-0 z-40 cursor-default"
                data-test={testId ? `${testId}-overlay` : undefined}
                onClick={() => setOpen(false)}
                tabIndex={-1}
                type="button"
              />
              <div
                className={cn(
                  "fixed z-50 min-w-56 rounded-md border border-lt-border bg-lt-popover p-1 text-lt-popover-fg shadow-lg",
                  className,
                )}
                ref={menuRef}
                role="menu"
                style={{
                  left: position.left,
                  top: position.top,
                  transform:
                    placement === "right"
                      ? undefined
                      : `translate(${align === "end" ? "-100%" : "0"}, ${placement === "top" ? "-100%" : "0"})`,
                }}
              >
                <CollapsedContext.Provider value={false}>{children}</CollapsedContext.Provider>
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
