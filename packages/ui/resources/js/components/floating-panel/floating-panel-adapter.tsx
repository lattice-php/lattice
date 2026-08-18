import { Renderer } from "@lattice-php/core/renderer";
import { toNodes } from "@lattice-php/core/nodes";
import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { FloatingPanel } from "./floating-panel";

const FloatingPanelAdapter: RendererComponent<"floating-panel"> = ({ children, node }) => {
  const trigger = toNodes(node.props.trigger);
  const identity = nodeIdentity(node);

  return (
    <FloatingPanel
      aria-label={node.props.label ?? undefined}
      data-lattice-component={identity}
      offset={node.props.offset ?? 16}
      placement={node.props.placement ?? "bottom-end"}
      trigger={trigger.length > 0 ? <Renderer nodes={trigger} /> : undefined}
      triggerProps={{ "data-test": identity ? `${identity}-trigger` : undefined }}
    >
      {children}
    </FloatingPanel>
  );
};

export default FloatingPanelAdapter;
