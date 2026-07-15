import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { coerceColor, colorValue, namedColor } from "@lattice-php/lattice/lib/color";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { Size } from "@lattice-php/lattice/types/generated";
import { CopyableText } from "./copyable-text";

const textAlignments: Record<string, string> = {
  center: "text-center",
  left: "text-left",
};

const textSizes: Record<Size, string> = {
  xs: "text-xs leading-5",
  sm: "text-sm leading-6",
  md: "text-base leading-7",
  lg: "text-lg leading-8",
  xl: "text-xl leading-8",
  "2xl": "text-2xl leading-9",
  "3xl": "text-3xl leading-10",
  "4xl": "text-4xl leading-none",
};

const TextComponent: RendererComponent<"text"> = ({ node }) => {
  const align = node.props.align ?? "left";
  const color = colorValue(coerceColor(node.props.color) ?? namedColor("muted"));

  const text = (
    <p
      className={cn(
        "m-0",
        "max-w-2xl",
        textAlignments[align] ?? textAlignments.left,
        textSizes[node.props.size],
      )}
      style={{ color }}
    >
      {node.props.text}
    </p>
  );

  if (!node.props.copyable) {
    return text;
  }

  return (
    <CopyableText value={node.props.text} label={node.props.text}>
      {text}
    </CopyableText>
  );
};

export default TextComponent;
