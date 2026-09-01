import type { Node, RemoteAccess } from "@lattice-php/core";

export type ChatBox = {
  fill: boolean;
  historyEndpoint: string | null;
  placeholder: string | null;
  remote: RemoteAccess | null;
  streamEndpoint: string | null;
  title: string | null;
};
export type ChatMessage = {
  readonly id: string;
  readonly parts: Node[];
  readonly role: ChatRole;
};
export type ChatNodeType = "chat.box" | "chat.part.text" | "chat.part.tool-call";
export type ChatRole = "user" | "assistant" | "system";
export type ComponentPropsMap = {
  "chat.box": ChatBox;
  "chat.part.text": TextPart;
  "chat.part.tool-call": ToolCallPart;
};
export type TextPart = {
  text: string;
};
export type ToolCallPart = {
  args: Record<string, unknown>;
  name: string;
};
