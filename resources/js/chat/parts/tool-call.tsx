import { testIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";

export const ToolCallPart: RendererComponent<"chat.part.tool-call"> = ({ node }) => {
  return (
    <div
      className="mt-1 inline-flex items-center gap-1 rounded-lt-sm bg-lt-muted px-2 py-0.5 font-mono text-xs text-lt-muted-fg"
      data-test={testIdentity("chat-tool-call")}
    >
      🔧 {node.props.name}({JSON.stringify(node.props.args)})
    </div>
  );
};

export default ToolCallPart;
