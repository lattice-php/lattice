import type { ChatPartComponent } from "../part-registry";
import type { ChatPart } from "../types";

export const TextPart: ChatPartComponent = ({ part }) => {
  const textPart = part as Extract<ChatPart, { type: "text" }>;

  return <div className="whitespace-pre-wrap text-sm">{textPart.text}</div>;
};
