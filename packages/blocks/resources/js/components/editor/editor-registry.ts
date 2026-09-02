import { useMemo } from "react";
import { eagerComponent, useComponentRegistry } from "@lattice-php/core";
import type { Registry } from "@lattice-php/core";
import EditorFrameAdapter from "./editor-frame";
import EditorSlotAdapter from "./editor-slot";

/**
 * The canvas renders blocks with the app's own components, swapping only the
 * frame and slot outlets for their editing counterparts.
 */
export function useEditorRegistry(): Registry {
  const components = useComponentRegistry();

  return useMemo(
    () => ({
      components: {
        ...components,
        "blocks.frame": eagerComponent(EditorFrameAdapter),
        "blocks.slot": eagerComponent(EditorSlotAdapter),
      },
      extensions: {},
    }),
    [components],
  );
}
