import type { Node } from "@lattice-php/lattice/core/types";
import type { ChatMessage, ChatRole } from "@lattice-php/lattice/types/generated";

export type { ChatMessage, ChatRole };

export type ChatStatus = "idle" | "submitted" | "streaming" | "error";

export type ChatFrame =
  | { type: "text"; value: string }
  | { type: "part"; part: Node }
  | { type: "done" }
  | { type: "error"; message?: string };

export type ChatTransportRequest = { url: string; body: unknown; signal: AbortSignal };
export type ChatTransport = (request: ChatTransportRequest) => AsyncGenerator<ChatFrame>;

export type UseChatReturn = {
  messages: ChatMessage[];
  status: ChatStatus;
  error: string | null;
  sendMessage: (text: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  stop: () => void;
  regenerate: () => void;
};
