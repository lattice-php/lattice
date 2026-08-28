import { Renderer } from "@lattice-php/core/renderer";
import { toNodes } from "@lattice-php/core/nodes";
import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Card } from "./card";

export const CardAdapter: RendererComponent<"card"> = ({ children, node }) => {
  const headerActions = toNodes(node.props.headerActions);
  const tooltip = node.props.tooltip;

  return (
    <Card
      className={node.props.class ?? undefined}
      data-test={nodeIdentity(node)}
      description={node.props.description}
      headerActions={headerActions.length > 0 ? <Renderer nodes={headerActions} /> : null}
      title={node.props.title}
      tooltip={tooltip ? <div dangerouslySetInnerHTML={{ __html: tooltip }} /> : null}
    >
      {children}
    </Card>
  );
};
