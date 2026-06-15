import type { ReactNode } from "react";
import type { ChatPart } from "./types";

export type { ChatPart };

export type ChatPartComponent = (props: { part: ChatPart }) => ReactNode;

const registry: Record<string, ChatPartComponent> = {};

export function registerChatPart(type: string, component: ChatPartComponent): void {
  registry[type] = component;
}

export function getChatPart(type: string): ChatPartComponent | undefined {
  return registry[type];
}
