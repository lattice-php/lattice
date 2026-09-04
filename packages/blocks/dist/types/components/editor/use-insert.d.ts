import { EditorStore } from '../../document/store';
import { BlockTarget, BlockTypeData } from '../../types';
import { InlineFocus } from './focus-registry';
export type InsertFocus = "block" | "inline" | "none";
export type InsertOptions = {
    data?: Record<string, unknown>;
    /** Where the caret goes afterwards: the block itself, its first inline editor, or nowhere. */
    focus?: InsertFocus;
};
export type InsertActions = {
    /** Insert one block, fetch its render, announce it and move focus; null when the slot refuses it. */
    insertBlock: (typeKey: string, target: BlockTarget, options?: InsertOptions) => string | null;
    /** Insert a pattern's blocks the same way; empty when the target refuses any of them. */
    insertPattern: (key: string, target: BlockTarget) => string[];
};
/**
 * Every way of adding blocks — library click, insert menu, drop, Enter in a
 * paragraph, slash menu — ends the same way: the new block renders, screen
 * readers hear about it and focus lands on it. This is that ending, once.
 */
export declare function useInsertActions({ store, types, requestRender, focusBlock, inline, }: {
    store: EditorStore;
    types: readonly BlockTypeData[];
    requestRender: (id: string) => void;
    focusBlock: (id: string) => void;
    inline: InlineFocus;
}): InsertActions;
