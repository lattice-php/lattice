import { Renderer } from "@lattice-php/core/renderer";
import { InfoTooltip } from "../info-tooltip";
import { nodeIdentity, prefixedTestId } from "@lattice-php/core/test-id";
import { toNodes } from "@lattice-php/core/nodes";
import type { RendererComponent } from "@lattice-php/core/types";
import { Disclosure } from "../disclosure";
import { useCollapsibleState } from "../use-collapsible-state";

const CollapsibleComponent: RendererComponent<"collapsible"> = ({ children, node }) => {
  const rememberState = node.props.rememberState !== false;
  const trigger = toNodes(node.props.trigger);
  const identity = nodeIdentity(node);
  const storageKey = `lattice:collapsible:${identity ?? "default"}`;

  const [open, toggle] = useCollapsibleState(
    storageKey,
    node.props.collapsed === false,
    rememberState,
  );

  function handleOpenChange(nextOpen: boolean): void {
    if (nextOpen !== open) {
      toggle();
    }
  }

  return (
    <Disclosure
      data-slot="collapsible"
      data-lattice-component={identity}
      onOpenChange={handleOpenChange}
      open={open}
      summary={
        <>
          <Renderer nodes={trigger} />
          {node.props.tooltip && <InfoTooltip content={node.props.tooltip} />}
        </>
      }
      summaryProps={{
        "data-test": prefixedTestId("collapsible-toggle", identity) ?? "collapsible-toggle-default",
      }}
    >
      {children}
    </Disclosure>
  );
};

export default CollapsibleComponent;
