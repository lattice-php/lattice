import type { CSSProperties } from "react";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import type { FloatingPlacement } from "@lattice-php/lattice/types/generated";

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
  const identity = nodeIdentity(node);
  const label = node.props.label ?? undefined;
  const offset = Math.max(0, node.props.offset ?? 16);
  const placement = node.props.placement ?? "bottom-end";

  return (
    <div
      aria-label={label}
      className="fixed z-50 max-w-[calc(100vw-2rem)] rounded-lt border border-lt-border bg-lt-popover p-1 text-lt-popover-fg shadow-md"
      data-lattice-component={identity}
      role={label ? "group" : undefined}
      style={placementStyle(placement, offset)}
    >
      {children}
    </div>
  );
};

export default FloatingPanelComponent;
