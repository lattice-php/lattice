import { testIdentity } from "@lattice-php/lattice/core/test-id";
import type { ChatPartComponent } from "../part-registry";
import type { ChatPart } from "../types";

export const ToolCallPart: ChatPartComponent = ({ part }) => {
  const toolCall = part as Extract<ChatPart, { type: "tool-call" }>;

  return (
    <div
      className="mt-1 inline-flex items-center gap-1 rounded-lt-sm bg-lt-muted px-2 py-0.5 font-mono text-xs text-lt-muted-fg"
      data-test={testIdentity("chat-tool-call")}
    >
      🔧 {toolCall.name}({JSON.stringify(toolCall.args)})
    </div>
  );
};
