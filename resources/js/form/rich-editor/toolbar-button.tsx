import * as React from "react";
import { Icon } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";

/**
 * The shared toolbar trigger: an icon button that keeps focus in the editor
 * (mousedown is prevented so clicks don't blur it, which would otherwise
 * trigger a precognition request).
 */
export function ToolbarIconButton({
  active = false,
  className,
  icon,
  label,
  testId,
  ...props
}: React.ComponentProps<"button"> & {
  active?: boolean;
  icon: string;
  label: string;
  testId: string;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      data-test={testId}
      title={label}
      type="button"
      {...props}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lt-sm text-lt-muted-fg transition-colors hover:bg-lt-accent hover:text-lt-accent-fg disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-lt-icon-md",
        active && "bg-lt-accent text-lt-accent-fg",
        className,
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        props.onMouseDown?.(event);
      }}
    >
      <Icon name={icon} />
    </button>
  );
}
