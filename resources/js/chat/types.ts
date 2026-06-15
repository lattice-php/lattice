export type ChatRole = "user" | "assistant" | "system";

export type ChatTextPart = { type: "text"; text: string };
export type ChatToolCallPart = { type: "tool-call"; name: string; args: Record<string, unknown> };
/** Open for other concepts: any { type, ... }. Renderers are looked up by `type`. */
export type ChatPart =
  | ChatTextPart
  | ChatToolCallPart
  | ({ type: string } & Record<string, unknown>);

export type ChatMessage = { id: string; role: ChatRole; parts: ChatPart[] };

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
