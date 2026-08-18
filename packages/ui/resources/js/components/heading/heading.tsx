import type { ComponentProps, ReactNode } from "react";
import { CopyableText } from "../../copyable-text";
import { InfoTooltip } from "../../info-tooltip";
import { cn } from "../../lib/utils";

export type HeadingProps = Omit<ComponentProps<"h1">, "children"> & {
  children: ReactNode;
  copyable?: boolean;
  copyLabel?: string;
  copyValue?: string;
  level?: number;
  tooltip?: string | null;
};

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export function Heading({
  children,
  className,
  copyable = false,
  copyLabel,
  copyValue,
  level = 1,
  tooltip,
  ...props
}: HeadingProps) {
  const resolvedLevel = Math.min(Math.max(level, 1), 6);
  const Component = headingTag(resolvedLevel);
  const heading = (
    <Component
      data-slot="heading"
      className={cn(
        "font-semibold tracking-normal text-balance text-lt-fg",
        resolvedLevel === 1 && "text-2xl font-bold leading-tight",
        resolvedLevel === 2 && "text-xl",
        resolvedLevel > 2 && "text-base",
        className,
      )}
      {...props}
    >
      {children}
      <InfoTooltip content={tooltip} />
    </Component>
  );
  const resolvedCopyValue = copyValue ?? (typeof children === "string" ? children : undefined);

  if (!copyable || resolvedCopyValue === undefined) {
    return heading;
  }

  return (
    <CopyableText value={resolvedCopyValue} label={copyLabel ?? resolvedCopyValue}>
      {heading}
    </CopyableText>
  );
}

function headingTag(level: number): HeadingTag {
  switch (level) {
    case 1:
      return "h1";
    case 2:
      return "h2";
    case 3:
      return "h3";
    case 4:
      return "h4";
    case 5:
      return "h5";
    default:
      return "h6";
  }
}
