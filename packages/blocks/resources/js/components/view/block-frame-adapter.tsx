import type { RendererComponent } from "@lattice-php/core";
import { Frame } from "./frame";

const BlockFrameAdapter: RendererComponent<"blocks.frame"> = ({ node, children }) => (
  <Frame
    classes={node.props.classes}
    anchor={node.props.style.anchor}
    className={node.props.class ?? undefined}
  >
    {children}
  </Frame>
);

export default BlockFrameAdapter;
