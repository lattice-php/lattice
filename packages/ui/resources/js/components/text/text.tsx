import type { ComponentProps, ReactNode } from "react";
import { CopyableText } from "../../copyable-text";
import { coerceColor, colorValue, namedColor } from "../../lib/color";
import { cn } from "../../lib/utils";
import type { Color } from "../../types";

export type TextAlign = "center" | "left";
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

export type TextProps = Omit<ComponentProps<"p">, "children" | "color"> & {
  align?: TextAlign;
  children: ReactNode;
  color?: Color | string | null;
  copyable?: boolean;
  copyLabel?: string;
  copyValue?: string;
  size?: TextSize;
};

const textAlignments: Record<TextAlign, string> = {
  center: "text-center",
  left: "text-left",
};

const textSizes: Record<TextSize, string> = {
  xs: "text-xs leading-5",
  sm: "text-sm leading-6",
  md: "text-base leading-7",
  lg: "text-lg leading-8",
  xl: "text-xl leading-8",
  "2xl": "text-2xl leading-9",
  "3xl": "text-3xl leading-10",
  "4xl": "text-4xl leading-none",
};

export function Text({
  align = "left",
  children,
  className,
  color,
  copyable = false,
  copyLabel,
  copyValue,
  size = "md",
  style,
  ...props
}: TextProps) {
  const resolvedColor = colorValue(coerceColor(color) ?? namedColor("muted"));
  const text = (
    <p
      data-slot="text"
      className={cn("m-0", textAlignments[align], textSizes[size], className)}
      style={{ color: resolvedColor, ...style }}
      {...props}
    >
      {children}
    </p>
  );
  const resolvedCopyValue = copyValue ?? (typeof children === "string" ? children : undefined);

  if (!copyable || resolvedCopyValue === undefined) {
    return text;
  }

  return (
    <CopyableText value={resolvedCopyValue} label={copyLabel ?? resolvedCopyValue}>
      {text}
    </CopyableText>
  );
}
