import { getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { cn } from "@lattice/lattice/lib/utils";

declare module "@lattice/lattice/core/types" {
  interface ComponentProps {
    text: {
      align?: string;
      text?: string;
    };
  }
}

const textAlignments: Record<string, string> = {
  center: "text-center",
  left: "text-left",
};

const TextComponent: RendererComponent<"text"> = ({ node }) => {
  const align = getStringProp(node.props, "align", "left");

  return (
    <p
      className={cn(
        "max-w-2xl text-base leading-7 text-lt-muted-fg",
        textAlignments[align] ?? textAlignments.left,
      )}
    >
      {getStringProp(node.props, "text")}
    </p>
  );
};

export default TextComponent;
