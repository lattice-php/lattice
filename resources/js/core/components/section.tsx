import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Renderer, useRendererContext } from "@lattice/lattice/core/renderer";
import type { Node, RendererComponent } from "@lattice/lattice/core/types";
import { cn } from "@lattice/lattice/lib/utils";

function readStored(key: string, remember: boolean, fallback: boolean): boolean {
  if (!remember || typeof window === "undefined") {
    return fallback;
  }

  const stored = window.localStorage.getItem(key);

  return stored === null ? fallback : stored === "true";
}

function getNodes(value: unknown): Node[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (node): node is Node =>
      typeof node === "object" && node !== null && "type" in node && typeof node.type === "string",
  );
}

const SectionComponent: RendererComponent<"section"> = ({ children, node }) => {
  const { title, description } = node.props;
  const collapsible = node.props.collapsible === true;
  const rememberState = node.props.rememberState !== false;
  const headerActions = getNodes(node.props.headerActions);
  const { fallback, missingComponent, registry } = useRendererContext();
  const storageKey = `lattice:section:${node.id ?? "default"}`;

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
      className="flex flex-col gap-6 rounded-lt border border-lt-border bg-lt-surface py-6 text-lt-surface-fg shadow-xs"
      data-lattice-component={node.id}
    >
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 px-6">
          <div className="flex min-w-0 items-start gap-2">
            {collapsible && (
              <button
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? "Expand section" : "Collapse section"}
                data-test={`section-toggle-${node.id ?? "default"}`}
                className="mt-0.5 inline-flex shrink-0 items-center rounded-md p-0.5 text-lt-muted-fg transition-colors hover:bg-lt-muted hover:text-lt-fg"
                onClick={toggle}
                type="button"
              >
                <ChevronDown
                  aria-hidden="true"
                  className={cn("size-4 transition-transform", isCollapsed && "-rotate-90")}
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
              <Renderer
                fallback={fallback}
                missingComponent={missingComponent}
                nodes={headerActions}
                registry={registry}
              />
            </div>
          )}
        </div>
      )}

      {!isCollapsed && children && <div className="flex flex-col gap-6 px-6">{children}</div>}
    </section>
  );
};

export default SectionComponent;
