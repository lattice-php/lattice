import { Editor } from "@tiptap/core";
import { Node as WireNode } from "@lattice-php/core/types";
/**
 * The picker dialog body for the media-image toolbar control, split out of
 * media-image.tsx so it (and the media-library grid stack it pulls in) loads
 * lazily instead of riding in the eager editor-extension bundle.
 */
export default function MediaImageDialog({
  editor,
  library,
}: {
  editor: Editor;
  library: WireNode;
}): import("react").JSX.Element;
