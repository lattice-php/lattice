import type { RendererComponent } from "@lattice/lattice/core/types";

const RawBlockComponent: RendererComponent<"raw-block"> = ({ node }) => (
  <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: node.props.html }} />
);

export default RawBlockComponent;
