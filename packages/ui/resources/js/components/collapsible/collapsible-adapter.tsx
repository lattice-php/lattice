import { Renderer } from "@lattice-php/core/renderer";
import { nodeIdentity, prefixedTestId } from "@lattice-php/core/test-id";
import { toNodes } from "@lattice-php/core/nodes";
import type { RendererComponent } from "@lattice-php/core/types";
import { useAccordionItem } from "../accordion/accordion";
import { Collapsible } from "./collapsible";

export const CollapsibleAdapter: RendererComponent<"collapsible"> = ({ children, node }) => {
  const rememberState = node.props.rememberState !== false;
  const trigger = toNodes(node.props.trigger);
  const identity = nodeIdentity(node);
  const accordionItem = useAccordionItem(identity);

  return (
    <Collapsible
      {...(accordionItem
        ? { onOpenChange: accordionItem.setOpen, open: accordionItem.open }
        : rememberState
          ? { storageKey: `lattice:collapsible:${identity ?? "default"}` }
          : {})}
      className={node.props.class ?? undefined}
      data-test={identity}
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
