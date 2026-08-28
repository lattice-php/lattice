import { Node } from "@lattice-php/core/types";
import { ChatMessage, ChatRole, ComponentPropsMap } from "./generated";
declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}
export type { ChatMessage, ChatRole };
export type ChatStatus = "idle" | "submitted" | "streaming" | "error";
export type ChatFrame =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "part";
      part: Node;
    }
  | {
      type: "done";
    }
  | {
      type: "error";
      message?: string;
    };
export type ChatTransportRequest = {
  url: string;
  body: unknown;
  signal: AbortSignal;
};
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
