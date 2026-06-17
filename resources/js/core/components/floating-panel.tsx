import { type CSSProperties, useState } from "react";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import type { FloatingPlacement } from "@lattice-php/lattice/types/generated";
import { RenderNode } from "@lattice-php/lattice/core/renderer";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import { cn } from "@lattice-php/lattice/lib/utils";

function placementStyle(placement: FloatingPlacement, offset: number): CSSProperties {
  if (placement === "top-start") {
    return { left: offset, top: offset };
  }

  if (placement === "top-end") {
    return { right: offset, top: offset };
  }

  if (placement === "bottom-start") {
    return { bottom: offset, left: offset };
  }

  return { bottom: offset, right: offset };
}

const FloatingPanelComponent: RendererComponent<"floating-panel"> = ({ children, node }) => {
  const label = node.props.label ?? undefined;
  const offset = Math.max(0, node.props.offset ?? 16);
  const placement = node.props.placement ?? "bottom-end";
  const trigger = node.props.trigger ?? [];
  const [open, setOpen] = useState(false);

  if (trigger.length === 0) {
    return (
      <div
        aria-label={label}
        className="fixed z-50 max-w-[calc(100vw-2rem)] rounded-lt border border-lt-border bg-lt-popover p-1 text-lt-popover-fg shadow-lt-md"
        data-lattice-component={nodeIdentity(node)}
        role={label ? "group" : undefined}
        style={placementStyle(placement, offset)}
      >
        {children}
      </div>
    );
  }

  const expandsUpward = placement === "bottom-start" || placement === "bottom-end";
  const anchorsToStart = placement === "top-start" || placement === "bottom-start";

  return (
    <div
      aria-label={label}
      className="fixed z-50 max-w-[calc(100vw-2rem)]"
      data-lattice-component={nodeIdentity(node)}
      role={label ? "group" : undefined}
      style={placementStyle(placement, offset)}
    >
      <div className={cn("flex w-fit gap-2", expandsUpward ? "flex-col-reverse" : "flex-col")}>
        <button
          aria-expanded={open}
          className={cn(
            "inline-flex items-center gap-2 rounded-lt border border-lt-border bg-lt-popover px-3 py-1.5 text-sm font-medium text-lt-popover-fg shadow-lt-md hover:bg-lt-muted",
            anchorsToStart ? "self-start" : "self-end",
          )}
          data-test={node.key ? `${node.key}-trigger` : undefined}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {trigger.map((triggerNode, index) => (
            <RenderNode
              key={triggerNode.key ?? `${triggerNode.type}-${index}`}
              node={triggerNode}
            />
          ))}
        </button>
        <div className={open ? "block" : "hidden"}>{children}</div>
      </div>
    </div>
  );
};

export default FloatingPanelComponent;
