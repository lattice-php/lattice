import type { Node } from "@lattice-php/lattice/core/types";
import type {
  ChatMessage as GeneratedChatMessage,
  ChatRole,
} from "@lattice-php/lattice/types/generated";

export type { ChatRole };

/**
 * A chat part is a component node, rendered by `type` through the component
 * registry like any other node. Built-in parts (`chat.part.*`) narrow to their
 * generated props; a consumer's custom part still type-checks as a loose node.
 */
export type ChatPart = Node;

/**
 * Sourced from the generated message shape but widened to the open `ChatPart`
 * so a message can carry a consumer's custom part.
 */
export type ChatMessage = Omit<GeneratedChatMessage, "parts"> & { parts: ChatPart[] };

export type ChatStatus = "idle" | "submitted" | "streaming" | "error";

export type ChatFrame =
  | { type: "text"; value: string }
  | { type: "part"; part: ChatPart }
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
