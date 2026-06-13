import { Icon } from "@lattice/lattice/icons";
import { useState } from "react";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { CollapsedContext } from "../core/collapsed-context";
import { cn } from "@lattice/lattice/lib/utils";

function readStored(key: string, remember: boolean): boolean {
  if (!remember || typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(key) === "true";
}

const SidebarComponent: RendererComponent<"sidebar"> = ({ children, node }) => {
  const collapsible = node.props.collapsible;
  const rememberState = node.props.rememberState;
  const storageKey = `lattice:sidebar:${node.id ?? "default"}`;

  const [collapsed, setCollapsed] = useState(() =>
    readStored(storageKey, collapsible && rememberState),
  );

  function toggle(): void {
    setCollapsed((value) => {
      const next = !value;

      if (rememberState && typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, String(next));
      }

      return next;
    });
  }

  const isCollapsed = collapsible && collapsed;

  return (
    <CollapsedContext.Provider value={isCollapsed}>
      <aside
        className={cn(
          "flex shrink-0 flex-col gap-4 border-r border-lt-border p-4 transition-[width]",
          isCollapsed ? "w-16 overflow-visible" : "w-64 overflow-hidden",
        )}
        data-lattice-component={node.id}
      >
        {collapsible ? (
          <button
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            data-test="sidebar-toggle"
            className={cn(
              "inline-flex items-center rounded-md p-2 text-lt-fg transition-colors hover:bg-lt-muted",
              isCollapsed ? "self-center" : "self-end",
            )}
            onClick={toggle}
            type="button"
          >
            <Icon name="panel-left" aria-hidden="true" className="size-lt-icon-md shrink-0" />
          </button>
        ) : null}
        {children}
      </aside>
    </CollapsedContext.Provider>
  );
};

export default SidebarComponent;
