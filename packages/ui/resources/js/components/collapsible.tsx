import { Renderer } from "@lattice-php/core/renderer";
import { InfoTooltip } from "../info-tooltip";
import { nodeIdentity, prefixedTestId } from "@lattice-php/core/test-id";
import { toNodes } from "@lattice-php/core/nodes";
import type { RendererComponent } from "@lattice-php/core/types";
import type { ToggleEvent } from "react";
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

  function handleToggle(event: ToggleEvent<HTMLDetailsElement>): void {
    if (event.currentTarget.open !== open) {
      toggle();
    }
  }

  return (
    <Disclosure
      data-slot="collapsible"
      data-lattice-component={identity}
      onToggle={handleToggle}
      open={open}
      summary={
        <>
          <Renderer nodes={trigger} />
          {node.props.tooltip && (
            <span
              role="presentation"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <InfoTooltip content={node.props.tooltip} />
            </span>
          )}
        </>
      }
      summaryProps={{
        "data-test": prefixedTestId("collapsible-toggle", identity) ?? "collapsible-toggle-default",
      }}
    >
      {open ? children : null}
    </Disclosure>
  );
};

export default CollapsibleComponent;
