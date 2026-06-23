import { useState } from "react";
import { Icon } from "@lattice-php/lattice/icons";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { InfoTooltip } from "./info-tooltip";
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

const CollapsibleComponent: RendererComponent<"collapsible"> = ({ children, node }) => {
  const rememberState = node.props.rememberState === true;
  const trigger = toNodes(node.props.trigger);
  const identity = nodeIdentity(node);
  const storageKey = `lattice:collapsible:${identity ?? "default"}`;
  const contentId = `${identity ?? "collapsible"}-content`;

  const [open, setOpen] = useState(() =>
    readStored(storageKey, rememberState, node.props.collapsed === false),
  );

  function toggle(): void {
    setOpen((value) => {
      const next = !value;

      if (rememberState && typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, String(next));
      }

      return next;
    });
  }

  return (
    <div data-lattice-component={identity}>
      <div
        aria-controls={contentId}
        aria-expanded={open}
        data-test={prefixedTestId("collapsible-toggle", identity) ?? "collapsible-toggle-default"}
        className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-lt-sm py-2 text-left text-lt-fg transition-colors hover:bg-lt-muted"
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Renderer nodes={trigger} />
          {node.props.tooltip && (
            <span
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <InfoTooltip content={node.props.tooltip} />
            </span>
          )}
        </div>
        <Icon
          name="chevron-down"
          className={cn(
            "size-lt-icon-md shrink-0 text-lt-muted-fg transition-transform",
            !open && "-rotate-90",
          )}
        />
      </div>

      {open && children && (
        <div id={contentId} className="flex flex-col gap-4 pt-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleComponent;
