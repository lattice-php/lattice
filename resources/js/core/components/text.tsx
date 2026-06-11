import type { RendererComponent } from "@lattice/lattice/core/types";
import { cn } from "@lattice/lattice/lib/utils";

const textAlignments: Record<string, string> = {
  center: "text-center",
  left: "text-left",
};

const TextComponent: RendererComponent<"text"> = ({ node }) => {
  const align = node.props.align ?? "left";

  return (
    <p
      className={cn(
        "max-w-2xl text-base leading-7 text-lt-muted-fg",
        textAlignments[align] ?? textAlignments.left,
      )}
    >
      {node.props.text}
    </p>
  );
};

export default TextComponent;
