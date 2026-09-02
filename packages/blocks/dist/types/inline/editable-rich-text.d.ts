import { Node } from "@lattice-php/core";
import { BlockBinding } from "./use-block-binding";
/**
 * A rich-text field edited in place with its own Tiptap instance. Undo belongs
 * to the block document, so Tiptap's history stays off; the slash menu offers
 * the blocks the surrounding slot accepts.
 */
export declare function EditableRichText({
  node,
  binding,
}: {
  node: Node;
  binding: BlockBinding;
}): import("react").JSX.Element | null;
