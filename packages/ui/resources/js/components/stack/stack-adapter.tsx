import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Stack } from "./stack";

export const StackAdapter: RendererComponent<"stack"> = ({ children, node }) => (
  <Stack
    align={node.props.align ?? undefined}
    data-test={nodeIdentity(node)}
    direction={node.props.direction ?? undefined}
    float={node.props.float ?? undefined}
    gap={node.props.gap ?? undefined}
    height={node.props.height ?? undefined}
    justify={node.props.justify ?? undefined}
    sticky={node.props.sticky}
    width={node.props.width ?? undefined}
  >
    {children}
  </Stack>
);
