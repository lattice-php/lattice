import type { RendererComponent } from "@lattice-php/lattice/core/types";

export const TextPart: RendererComponent<"chat.part.text"> = ({ node }) => {
  return <div className="whitespace-pre-wrap text-sm">{node.props.text}</div>;
};

export default TextPart;
