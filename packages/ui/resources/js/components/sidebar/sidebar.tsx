import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { CollapsedProvider } from "@lattice-php/core/collapsed-context";
import { useWindowEvent } from "@lattice-php/core/hooks/use-window-event";
import { cn } from "../../lib/utils";
import { useMediaQuery } from "../../lib/use-media-query";

export const SIDEBAR_DESKTOP_QUERY = "(min-width: 768px)";

export type SidebarBackdropProps = Omit<ComponentProps<"div">, "aria-hidden" | "onClick"> & {
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
};

export type SidebarProps = Omit<ComponentProps<"aside">, "children"> & {
  backdropProps?: SidebarBackdropProps;
  children?: ReactNode;
  /** Collapses the desktop rail to icons; ignored below the `md` breakpoint. */
  collapsed?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Whether the off-canvas drawer is open below the `md` breakpoint. */
  open?: boolean;
};

export function Sidebar({
  backdropProps,
  children,
  className,
  collapsed = false,
  defaultOpen = false,
  onOpenChange,
  open,
  ...props
}: SidebarProps) {
  const isDesktop = useMediaQuery(SIDEBAR_DESKTOP_QUERY, true);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;
  const isCollapsed = collapsed && isDesktop;

  function close(): void {
    if (open === undefined) {
      setUncontrolledOpen(false);
    }

    onOpenChange?.(false);
  }

  useWindowEvent(
    "keydown",
    (event) => {
      if ((event as KeyboardEvent).key === "Escape") {
        close();
      }
    },
    { enabled: isOpen },
  );

  return (
    <CollapsedProvider collapsed={isCollapsed}>
      {isOpen ? (
        <div
          {...backdropProps}
          aria-hidden="true"
          className={cn(
            "fixed inset-0 z-lt-overlay bg-lt-overlay md:hidden",
            backdropProps?.className,
          )}
          onClick={close}
        />
      ) : null}
      <aside
        {...props}
        className={cn(
          "fixed inset-y-0 left-0 z-lt-modal flex h-svh w-72 max-w-[80vw] shrink-0 flex-col gap-4 border-r border-lt-border bg-lt-bg p-4 transition-transform",
          "md:sticky md:top-0 md:z-auto md:max-w-none md:translate-x-0 md:transition-[width]",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed
            ? "md:w-16 md:overflow-visible"
            : "md:w-64 md:overflow-x-hidden md:overflow-y-auto",
          className,
        )}
        data-collapsed={isCollapsed ? "true" : "false"}
      >
        {children}
      </aside>
    </CollapsedProvider>
  );
}

export type SidebarFooterProps = ComponentProps<"div">;

export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return <div {...props} className={cn("mt-auto flex flex-col gap-4", className)} />;
}
