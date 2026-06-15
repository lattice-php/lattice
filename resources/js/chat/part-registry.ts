import type { ReactNode } from "react";
import type { ChatPart } from "./types";

export type { ChatPart };

export type ChatPartComponent = (props: { part: ChatPart }) => ReactNode;

export type ChatPartRegistry = Record<string, ChatPartComponent>;

export function mergeChatParts(
  ...registries: Array<ChatPartRegistry | undefined>
): ChatPartRegistry {
  return registries.reduce<ChatPartRegistry>(
    (merged, registry) => ({ ...merged, ...registry }),
    {},
  );
}
