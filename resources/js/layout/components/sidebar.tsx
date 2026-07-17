import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { CollapsedContext } from "@lattice-php/lattice/core/collapsed-context";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";
import { useWindowEvent } from "@lattice-php/lattice/core/hooks/use-window-event";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useMediaQuery } from "@lattice-php/lattice/lib/use-media-query";
import { useCollapsibleState } from "@lattice-php/lattice/ui/use-collapsible-state";

const DESKTOP_QUERY = "(min-width: 768px)";

function matchesTarget(event: Event, identity: string | undefined): boolean {
  const target = (event as CustomEvent<{ target?: string }>).detail?.target;

  return target == null || target === identity;
}

const SidebarComponent: RendererComponent<"sidebar"> = ({ children, node }) => {
  const collapsible = node.props.collapsible;
  const rememberState = node.props.rememberState;
  const identity = nodeIdentity(node);
  const storageKey = `lattice:sidebar:${identity ?? "default"}`;
  const isDesktop = useMediaQuery(DESKTOP_QUERY, true);

  const [collapsed, toggleCollapsed] = useCollapsibleState(
    storageKey,
    false,
    collapsible && rememberState,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useWindowEvent(LATTICE_EVENT.toggleSidebar, (event) => {
    if (!matchesTarget(event, identity)) {
      return;
    }

    if (window.matchMedia?.(DESKTOP_QUERY).matches ?? true) {
      if (collapsible) {
        toggleCollapsed();
      }
    } else {
      setMobileOpen((open) => !open);
    }
  });

  useEffect(() => router.on("navigate", () => setMobileOpen(false)), []);

  useWindowEvent(
    "keydown",
    (event) => {
      if ((event as KeyboardEvent).key === "Escape") {
        setMobileOpen(false);
      }
    },
    { enabled: mobileOpen },
  );

  const isCollapsed = collapsible && collapsed && isDesktop;

  return (
    <CollapsedContext.Provider value={isCollapsed}>
      {mobileOpen ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-lt-overlay bg-lt-overlay md:hidden"
          data-test="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-lt-modal flex h-svh w-72 max-w-[80vw] shrink-0 flex-col gap-4 border-r border-lt-border bg-lt-bg p-4 transition-transform",
          "md:sticky md:top-0 md:z-auto md:max-w-none md:translate-x-0 md:transition-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed
            ? "md:w-16 md:overflow-visible"
            : "md:w-64 md:overflow-x-hidden md:overflow-y-auto",
        )}
        data-collapsed={isCollapsed ? "true" : "false"}
        data-lattice-component={identity}
        data-test="sidebar"
      >
        {children}
      </aside>
    </CollapsedContext.Provider>
  );
};

export default SidebarComponent;
