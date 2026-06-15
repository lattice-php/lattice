import type { ReactNode } from "react";
import type { ChatPart } from "./types";

export type { ChatPart };

export type ChatPartComponent = (props: { part: ChatPart }) => ReactNode;

export type ChatPartRegistry = Record<string, ChatPartComponent>;
