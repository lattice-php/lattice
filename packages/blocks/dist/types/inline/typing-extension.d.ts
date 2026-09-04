import { Extension } from '@tiptap/core';
import { RefObject } from 'react';
import { RichDocument } from './typing';
export type RichTypingHandlers = {
    split: (before: RichDocument | null, after: RichDocument | null) => boolean;
    mergeBackward: (content: RichDocument | null) => boolean;
    arrow: (direction: "up" | "down") => boolean;
};
/**
 * Block-level keys for an inline rich-text editor: Enter in a top-level
 * paragraph splits the block, Backspace at the very start merges it into the
 * previous block, and the arrow keys leave the block at its first or last
 * line. Runs before the built-in keymaps, which would otherwise consume the
 * keys, and steps aside while the slash menu is open.
 */
export declare function createTypingExtension(handlers: RefObject<RichTypingHandlers | null>): Extension<any, any>;
