import type { ChatPart, ChatPartComponent } from "@lattice-php/lattice";
import { createPlugin } from "@lattice-php/lattice";
import { testIdentity } from "@lattice-php/lattice/core/test-id";

const ToolCallPart: ChatPartComponent = ({ part }) => {
  if (part.type !== "tool-call") {
    return null;
  }

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

export const appChatParts = createPlugin({
  name: "workbench-chat-parts",
  chatParts: { "tool-call": ToolCallPart },
});
