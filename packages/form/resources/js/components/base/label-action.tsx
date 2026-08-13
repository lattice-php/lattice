import type { Node } from "@lattice-php/core";
import { RenderNode } from "@lattice-php/core/renderer";
import type { ReactNode } from "react";

/**
 * Converts a field's `labelAction` wire node into the ReactNode
 * FormFieldFrame renders at the end of the label row.
 */
export function fieldLabelAction(labelAction: Node | null | undefined): ReactNode {
  return labelAction ? <RenderNode node={labelAction} /> : undefined;
}
