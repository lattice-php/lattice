import { Node } from '@tiptap/core';
import { NodeViewProps } from '@tiptap/react';
type MediaImageOptions = {
    conversions: string[];
};
export declare function MediaImageView({ editor, extension, node, selected, updateAttributes, }: NodeViewProps): import("react").JSX.Element;
export declare const MediaImageNode: Node<MediaImageOptions, any>;
export declare function registerMediaImage(): void;
export {};
