import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { CodeBlock } from "./code-block";

export const CodeBlockAdapter: RendererComponent<"code-block"> = ({ node }) => (
  <CodeBlock
    className={node.props.class ?? undefined}
    copyable={node.props.copyable}
    data-test={nodeIdentity(node)}
    language={node.props.language}
    lineNumbers={node.props.lineNumbers}
    maxHeight={node.props.maxHeight}
    wrap={node.props.wrap}
  >
    {node.props.code}
  </CodeBlock>
);
