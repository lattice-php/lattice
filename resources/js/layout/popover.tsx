import { usePage } from "@inertiajs/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@lattice/lattice/lib/utils";
import { SidebarCollapsedContext } from "./context";

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

  // Once open, nudge the menu back inside the viewport. A "right"-placed menu
  // anchored to a trigger near the bottom (e.g. a sidebar user menu) would
  // otherwise spill off-screen.
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!open || !menu) {
      return;
    }

    const rect = menu.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return;
    }

    const margin = 8;
    let dx = 0;
    let dy = 0;

    if (rect.right > window.innerWidth - margin) {
      dx = window.innerWidth - margin - rect.right;
    }
    if (rect.left + dx < margin) {
      dx = margin - rect.left;
    }
    if (rect.bottom > window.innerHeight - margin) {
      dy = window.innerHeight - margin - rect.bottom;
    }
    if (rect.top + dy < margin) {
      dy = margin - rect.top;
    }

    if (dx !== 0 || dy !== 0) {
      setPosition((current) => ({ left: current.left + dx, top: current.top + dy }));
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
                <SidebarCollapsedContext.Provider value={false}>
                  {children}
                </SidebarCollapsedContext.Provider>
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
