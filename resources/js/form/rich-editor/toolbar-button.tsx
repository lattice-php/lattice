import * as React from "react";
import { IconButton } from "@lattice-php/lattice/ui/icon-button";

/**
 * The shared editor toolbar trigger: an {@link IconButton} that keeps focus in
 * the editor (mousedown is prevented so clicks don't blur it, which would
 * otherwise trigger a precognition request).
 */
export function ToolbarIconButton({
  active = false,
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
    <IconButton
      size="sm"
      icon={icon}
      label={label}
      title={label}
      active={active}
      data-test={testId}
      {...props}
      onMouseDown={(event) => {
        event.preventDefault();
        props.onMouseDown?.(event);
      }}
    />
  );
}
