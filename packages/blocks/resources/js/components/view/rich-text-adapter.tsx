import type { RendererComponent } from "@lattice-php/core";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { cn } from "@lattice-php/ui/lib/utils";

/** Rich text outside the editor: the server-sanitized HTML, nothing else. */
const RichTextAdapter: RendererComponent<"blocks.rich-text"> = ({ node }) => (
  <div
    className={cn(node.props.class ?? undefined)}
    data-test={nodeIdentity(node)}
    dangerouslySetInnerHTML={{ __html: node.props.html }}
  />
);

export default RichTextAdapter;
