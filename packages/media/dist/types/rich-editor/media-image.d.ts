import { Node } from "@tiptap/core";
import { NodeViewProps } from "@tiptap/react";
import {
  EditorExtensionPayloadOf,
  RichEditorExtensionDefinition,
} from "@lattice-php/form/rich-editor";
type MediaImageOptions = {
  conversions: string[];
};
export declare function MediaImageView({
  editor,
  extension,
  node,
  selected,
  updateAttributes,
}: NodeViewProps): import("react").JSX.Element;
export declare const MediaImageNode: Node<MediaImageOptions, any>;
export declare const mediaImageExtension: RichEditorExtensionDefinition<
  Partial<EditorExtensionPayloadOf<"media-image">>
>;

