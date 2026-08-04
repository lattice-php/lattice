import * as React from "react";
/**
 * The shared editor toolbar trigger: an {@link IconButton} that keeps focus in
 * the editor (mousedown is prevented so clicks don't blur it, which would
 * otherwise trigger a precognition request).
 */
export declare function ToolbarIconButton({ active, icon, label, testId, ...props }: React.ComponentProps<"button"> & {
    active?: boolean;
    icon: string;
    label: string;
    testId: string;
}): React.JSX.Element;
