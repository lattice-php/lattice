import type { RendererComponent } from "@lattice/lattice/core/types";
import { cn } from "@lattice/lattice/lib/utils";
import type { Color, Size } from "@lattice/lattice/types/generated";

const textAlignments: Record<string, string> = {
  center: "text-center",
  left: "text-left",
};

const textColors: Record<Color, string> = {
  default: "text-lt-fg",
  muted: "text-lt-muted-fg",
  primary: "text-lt-primary",
  success: "text-lt-success",
  info: "text-lt-info",
  warning: "text-lt-warning",
  danger: "text-lt-danger",
};

const textSizes: Record<Size, string> = {
  xs: "text-xs leading-5",
  sm: "text-sm leading-6",
  md: "text-base leading-7",
  lg: "text-lg leading-8",
  xl: "text-xl leading-8",
};

const TextComponent: RendererComponent<"text"> = ({ node }) => {
  const align = node.props.align ?? "left";

  return (
    <p
      className={cn(
        "m-0",
        "max-w-2xl",
        textAlignments[align] ?? textAlignments.left,
        textColors[node.props.color],
        textSizes[node.props.size],
      )}
    >
      {node.props.text}
    </p>
  );
};

export default TextComponent;
