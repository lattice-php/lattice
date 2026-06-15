import type {
  ChatMessage as GeneratedChatMessage,
  ChatPart as GeneratedChatPart,
  ChatRole,
} from "@lattice-php/lattice/types/generated";

export type { ChatRole };

/**
 * The generated union of built-in parts, kept open so a consumer's custom part
 * (rendered by a registered renderer, not yet augmented into the generated
 * union) still type-checks. Renderers are looked up by `type`.
 */
export type ChatPart = GeneratedChatPart | ({ type: string } & Record<string, unknown>);

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
