import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Accordion } from "./accordion";

export const AccordionAdapter: RendererComponent<"accordion"> = ({ children, node }) => {
  const items = (node.schema ?? [])
    .map(nodeIdentity)
    .filter((identity): identity is string => identity !== undefined);

  return (
    <Accordion
      className={node.props.class ?? undefined}
      data-test={nodeIdentity(node)}
      defaultOpen={node.props.defaultOpen}
      gap={node.props.gap ?? undefined}
      items={items}
    >
      {children}
    </Accordion>
  );
};
