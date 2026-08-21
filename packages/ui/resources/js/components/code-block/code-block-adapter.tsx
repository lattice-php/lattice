import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { CodeBlock } from "./code-block";

const CodeBlockAdapter: RendererComponent<"code-block"> = ({ node }) => (
  <CodeBlock
    copyable={node.props.copyable}
    data-lattice-component={nodeIdentity(node)}
    language={node.props.language}
    lineNumbers={node.props.lineNumbers}
    maxHeight={node.props.maxHeight}
    wrap={node.props.wrap}
  >
    {node.props.code}
  </CodeBlock>
);

export default CodeBlockAdapter;
