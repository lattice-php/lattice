import type { ReactNode } from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { testIdentity } from "@lattice-php/lattice/core/test-id";
import { getChatPart } from "../part-registry";
import "../parts/text";
import type { ChatMessage } from "../types";

export function Message({ message }: { message: ChatMessage }): ReactNode {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}
      data-test={testIdentity(`chat-message-${message.role}`)}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lt-md px-3 py-2 text-sm",
          isUser ? "bg-lt-primary text-lt-primary-fg" : "bg-lt-muted text-lt-fg",
        )}
      >
        {message.parts.map((part, index) => {
          const Component = getChatPart(part.type);
          if (!Component) {
            return null;
          }

          return <Component key={index} part={part} />;
        })}
      </div>
    </div>
  );
}
