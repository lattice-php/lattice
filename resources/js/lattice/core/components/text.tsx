import { getStringProp } from "@/lattice/core/props";
import type { LatticeRendererComponent } from "@/lattice/core/types";
import { cn } from "@/lib/utils";

declare module "@/lattice/core/types" {
  interface LatticeComponentProps {
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

const TextComponent: LatticeRendererComponent<"text"> = ({ node }) => {
  const align = getStringProp(node.props, "align", "left");

  return (
    <p
      className={cn(
        "max-w-2xl text-base leading-7 text-muted-foreground",
        textAlignments[align] ?? textAlignments.left,
      )}
    >
      {getStringProp(node.props, "text")}
    </p>
  );
};

export default TextComponent;
