import type { ChatPartComponent } from "../part-registry";
import { registerChatPart } from "../part-registry";
import type { ChatTextPart } from "../types";

export const TextPart: ChatPartComponent = ({ part }) => {
  const textPart = part as ChatTextPart;

  return <div className="whitespace-pre-wrap text-sm">{textPart.text}</div>;
};

registerChatPart("text", TextPart);
