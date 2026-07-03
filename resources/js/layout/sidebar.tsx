import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { CollapsedContext } from "../core/collapsed-context";
import { LATTICE_EVENT } from "@lattice-php/lattice/events/event-names";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import { cn } from "@lattice-php/lattice/lib/utils";

const DESKTOP_QUERY = "(min-width: 768px)";

function readStored(key: string, remember: boolean): boolean {
  if (!remember || typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(key) === "true";
}

function matchesTarget(event: Event, identity: string | undefined): boolean {
  const target = (event as CustomEvent<{ target?: string }>).detail?.target;

  return target == null || target === identity;
}

function useIsDesktop(): boolean {
  const supported = () => typeof window !== "undefined" && typeof window.matchMedia === "function";
  const [isDesktop, setIsDesktop] = useState(() =>
    supported() ? window.matchMedia(DESKTOP_QUERY).matches : true,
  );

  useEffect(() => {
    if (!supported()) {
      return;
    }

    const query = window.matchMedia(DESKTOP_QUERY);
    const update = (): void => setIsDesktop(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

const SidebarComponent: RendererComponent<"sidebar"> = ({ children, node }) => {
  const collapsible = node.props.collapsible;
  const rememberState = node.props.rememberState;
  const identity = nodeIdentity(node);
  const storageKey = `lattice:sidebar:${identity ?? "default"}`;
  const isDesktop = useIsDesktop();

  const [collapsed, setCollapsed] = useState(() =>
    readStored(storageKey, collapsible && rememberState),
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function toggle(event: Event): void {
      if (!matchesTarget(event, identity)) {
        return;
      }

      if (window.matchMedia?.(DESKTOP_QUERY).matches ?? true) {
        if (!collapsible) {
          return;
        }

        setCollapsed((value) => {
          const next = !value;

          if (rememberState && typeof window !== "undefined") {
            window.localStorage.setItem(storageKey, String(next));
          }

          return next;
        });
      } else {
        setMobileOpen((open) => !open);
      }
    }

    window.addEventListener(LATTICE_EVENT.toggleSidebar, toggle);

    return () => window.removeEventListener(LATTICE_EVENT.toggleSidebar, toggle);
  }, [identity, collapsible, rememberState, storageKey]);

  useEffect(() => router.on("navigate", () => setMobileOpen(false)), []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    function close(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", close);

    return () => window.removeEventListener("keydown", close);
  }, [mobileOpen]);

  const isCollapsed = collapsible && collapsed && isDesktop;

  return (
    <CollapsedContext.Provider value={isCollapsed}>
      {mobileOpen ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-lt-overlay md:hidden"
          data-test="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-svh w-72 max-w-[80vw] shrink-0 flex-col gap-4 border-r border-lt-border bg-lt-bg p-4 transition-transform",
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
