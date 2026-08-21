import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import type { RendererComponent } from "@lattice-php/core/types";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { useWindowEvent } from "@lattice-php/core/hooks/use-window-event";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { Sidebar, SIDEBAR_DESKTOP_QUERY } from "@lattice-php/ui/components/sidebar/sidebar";
import { useCollapsibleState } from "@lattice-php/ui/lib/use-collapsible-state";

function matchesTarget(event: Event, identity: string | undefined): boolean {
  const target = (event as CustomEvent<{ target?: string }>).detail?.target;

  return target == null || target === identity;
}

const SidebarComponent: RendererComponent<"sidebar"> = ({ children, node }) => {
  const collapsible = node.props.collapsible;
  const rememberState = node.props.rememberState;
  const identity = nodeIdentity(node);
  const storageKey = `lattice:sidebar:${identity ?? "default"}`;

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

    if (window.matchMedia?.(SIDEBAR_DESKTOP_QUERY).matches ?? true) {
      if (collapsible) {
        toggleCollapsed();
      }
    } else {
      setMobileOpen((open) => !open);
    }
  });

  useEffect(() => router.on("navigate", () => setMobileOpen(false)), []);

  return (
    <Sidebar
      backdropProps={{ "data-test": "sidebar-backdrop" }}
      collapsed={collapsible && collapsed}
      data-lattice-component={identity}
      data-test="sidebar"
      onOpenChange={setMobileOpen}
      open={mobileOpen}
    >
      {children}
    </Sidebar>
  );
};

export default SidebarComponent;
