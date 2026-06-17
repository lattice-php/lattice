import { useState } from "react";
import { Icon } from "@lattice-php/lattice/icons";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { nodeIdentity, prefixedTestId } from "@lattice-php/lattice/core/test-id";
import { toNodes } from "@lattice-php/lattice/core/nodes";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { cn } from "@lattice-php/lattice/lib/utils";

function readStored(key: string, remember: boolean, fallback: boolean): boolean {
  if (!remember || typeof window === "undefined") {
    return fallback;
  }

  const stored = window.localStorage.getItem(key);

  return stored === null ? fallback : stored === "true";
}

const SectionComponent: RendererComponent<"section"> = ({ children, node }) => {
  const { title, description } = node.props;
  const collapsible = node.props.collapsible === true;
  const rememberState = node.props.rememberState !== false;
  const headerActions = toNodes(node.props.headerActions);
  const identity = nodeIdentity(node);
  const storageKey = `lattice:section:${identity ?? "default"}`;

  const [collapsed, setCollapsed] = useState(() =>
    readStored(storageKey, collapsible && rememberState, node.props.collapsed === true),
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
  const hasHeader = Boolean(title || description || headerActions.length > 0 || collapsible);

  return (
    <section
      className="flex flex-col gap-6 rounded-lt border border-lt-border bg-lt-surface py-6 text-lt-surface-fg shadow-lt-sm"
      data-lattice-component={identity}
    >
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 px-6">
          <div className="flex min-w-0 items-start gap-2">
            {collapsible && (
              <button
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? "Expand section" : "Collapse section"}
                data-test={prefixedTestId("section-toggle", identity) ?? "section-toggle-default"}
                className="mt-0.5 inline-flex shrink-0 items-center rounded-lt-sm p-0.5 text-lt-muted-fg transition-colors hover:bg-lt-muted hover:text-lt-fg"
                onClick={toggle}
                type="button"
              >
                <Icon
                  name="chevron-down"
                  className={cn(
                    "size-lt-icon-md transition-transform",
                    isCollapsed && "-rotate-90",
                  )}
                />
              </button>
            )}
            <div className="flex min-w-0 flex-col gap-1.5">
              {title && <div className="font-semibold leading-none">{title}</div>}
              {description && <div className="text-sm text-lt-muted-fg">{description}</div>}
            </div>
          </div>

          {headerActions.length > 0 && (
            <div className="flex shrink-0 items-center gap-2">
              <Renderer nodes={headerActions} />
            </div>
          )}
        </div>
      )}

      {!isCollapsed && children && <div className="flex flex-col gap-6 px-6">{children}</div>}
    </section>
  );
};

export default SectionComponent;
