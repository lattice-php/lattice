import { Editor } from '@tiptap/core';
import { ToolbarEntry } from '@lattice-php/form/rich-editor/registry';
/** The formatting controls of an inline rich-text editor, rendered inside the block toolbar. */
export declare function RichTextToolbar({ editor, items }: {
    editor: Editor;
    items: ToolbarEntry[];
}): import("react").JSX.Element;
