import { usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@lattice/lattice/lib/utils";
import { SidebarCollapsedContext } from "./context";

export function Popover({
  align = "start",
  children,
  className,
  testId,
  trigger,
}: {
  align?: "start" | "end";
  children: ReactNode;
  className?: string;
  testId?: string;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const url = usePage().url;

  useEffect(() => setOpen(false), [url]);

  function toggle(): void {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        left: align === "end" ? rect.right : rect.left,
        top: rect.bottom + 4,
      });
    }
    setOpen((value) => !value);
  }

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="w-full"
        data-test={testId}
        onClick={toggle}
        ref={triggerRef}
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
                role="menu"
                style={{
                  left: position.left,
                  top: position.top,
                  transform: align === "end" ? "translateX(-100%)" : undefined,
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
