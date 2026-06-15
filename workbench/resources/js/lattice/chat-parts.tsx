import type { ChatPart, ChatPartComponent, ChatToolCallPart } from "@lattice-php/lattice";
import { registerChatPart } from "@lattice-php/lattice";
import { testIdentity } from "@lattice-php/lattice/core/test-id";

function isToolCallPart(part: ChatPart): part is ChatToolCallPart {
  return part.type === "tool-call";
}

export const ToolCallPart: ChatPartComponent = ({ part }) => {
  if (!isToolCallPart(part)) {
    return null;
  }

  return (
    <div
      className="mt-1 inline-flex items-center gap-1 rounded-lt-sm bg-lt-muted px-2 py-0.5 font-mono text-xs text-lt-muted-fg"
      data-test={testIdentity("chat-tool-call")}
    >
      🔧 {part.name}({JSON.stringify(part.args)})
    </div>
  );
};

registerChatPart("tool-call", ToolCallPart);
