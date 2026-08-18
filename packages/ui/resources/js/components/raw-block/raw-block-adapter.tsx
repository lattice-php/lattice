import type { RendererComponent } from "@lattice-php/core/types";

const RawBlockAdapter: RendererComponent<"raw-block"> = ({ node }) => (
  <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: node.props.html }} />
);

export default RawBlockAdapter;
