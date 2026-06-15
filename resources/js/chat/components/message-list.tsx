import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { testIdentity } from "@lattice-php/lattice/core/test-id";
import type { ChatMessage } from "../types";
import { Message } from "./message";

export function MessageList({ messages }: { messages: ChatMessage[] }): ReactNode {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessage = messages.at(-1);
  const lastPartLength =
    lastMessage?.parts.at(-1) !== undefined ? JSON.stringify(lastMessage.parts.at(-1)).length : 0;

  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === "function") {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, lastPartLength]);

  return (
    <div
      className="flex flex-col gap-2 overflow-y-auto p-3"
      data-test={testIdentity("chat-messages")}
    >
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
