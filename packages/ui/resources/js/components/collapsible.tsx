import { Renderer } from "@lattice-php/core/renderer";
import { nodeIdentity, prefixedTestId } from "@lattice-php/core/test-id";
import { toNodes } from "@lattice-php/core/nodes";
import type { RendererComponent } from "@lattice-php/core/types";
import { Collapsible } from "../collapsible";

const CollapsibleComponent: RendererComponent<"collapsible"> = ({ children, node }) => {
  const rememberState = node.props.rememberState !== false;
  const trigger = toNodes(node.props.trigger);
  const identity = nodeIdentity(node);

  return (
    <Collapsible
      {...(rememberState ? { storageKey: `lattice:collapsible:${identity ?? "default"}` } : {})}
      data-lattice-component={identity}
      defaultOpen={node.props.collapsed === false}
      tooltip={node.props.tooltip}
      trigger={<Renderer nodes={trigger} />}
      triggerProps={{
        "data-test": prefixedTestId("collapsible-toggle", identity) ?? "collapsible-toggle-default",
      }}
    >
      {children}
    </Collapsible>
  );
};

export default CollapsibleComponent;
