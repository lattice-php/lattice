import type { RendererComponent } from "@lattice-php/core";
import { Frame } from "./frame";

const BlockFrameAdapter: RendererComponent<"blocks.frame"> = ({ node, children }) => (
  <Frame style={node.props.style} className={node.props.class ?? undefined}>
    {children}
  </Frame>
);

export default BlockFrameAdapter;
