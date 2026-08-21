import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Image } from "./image";

export const ImageAdapter: RendererComponent<"image"> = ({ node }) => (
  <Image
    alt={node.props.alt}
    circular={node.props.circular}
    data-test={nodeIdentity(node)}
    previewable={node.props.previewable}
    size={node.props.size}
    src={node.props.src}
    testId={nodeIdentity(node)}
  />
);
