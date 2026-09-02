import type { RendererComponent } from "@lattice-php/core";
import { UnknownBlock } from "./unknown-block";

const UnknownBlockAdapter: RendererComponent<"blocks.unknown"> = ({ node }) => (
  <UnknownBlock blockType={node.props.blockType} />
);

export default UnknownBlockAdapter;
