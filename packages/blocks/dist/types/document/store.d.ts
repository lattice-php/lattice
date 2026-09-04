import { Node } from '@lattice-php/core';
import { BlockDocument, BlockErrors, BlockPatternData, BlockStyle, BlockTarget, BlockTypeData, CanvasWidth } from '../types';
import { History } from './history';
export type SaveState = "idle" | "dirty" | "saving" | "saved" | "conflict" | "error";
export type EditorState = {
    document: BlockDocument;
    history: History<BlockDocument>;
    rendered: Record<string, Node>;
    types: readonly BlockTypeData[];
    patterns: readonly BlockPatternData[];
    /** The block type an empty page opens with and Enter splits into; null when the editor offers none. */
    seedType: string | null;
    canvasWidth: CanvasWidth;
    selectedId: string | null;
    revision: number;
    saveState: SaveState;
    publishing: boolean;
    publishedAt: number | null;
    errors: BlockErrors;
    /** Blocks whose render no longer matches their data and must be fetched again. */
    staleIds: readonly string[];
    /** Bumped on undo/redo so inspector forms re-seed from the restored data. */
    travelCount: number;
};
export type EditorStore = {
    getState: () => EditorState;
    setState: (updater: (current: EditorState) => EditorState) => void;
    subscribe: (listener: () => void) => () => void;
};
export declare function createEditorStore(initial: {
    document: BlockDocument;
    rendered: Record<string, Node>;
    types: readonly BlockTypeData[];
    patterns?: readonly BlockPatternData[];
    seedType?: string | null;
    revision: number;
}): EditorStore;
export declare function select(state: EditorState, id: string | null): EditorState;
export declare function setCanvasWidth(state: EditorState, canvasWidth: CanvasWidth): EditorState;
/**
 * Where a library insertion lands: right after the selected block when every
 * inserted type is allowed there, otherwise at the end of the document root.
 */
export declare function insertTargetFor(state: EditorState, blockTypes: readonly string[]): BlockTarget;
/**
 * Insert a pattern's blocks, each with fresh ids, one after another at the
 * target. Every root block must fit the target slot or nothing is inserted.
 */
export declare function insertPattern(state: EditorState, key: string, target: BlockTarget): {
    state: EditorState;
    ids: string[];
};
/** A page without blocks opens with one seed block so writing can start at once. */
export declare function seedDocument(document: BlockDocument, types: readonly BlockTypeData[], seedType: string | null): BlockDocument;
export declare function insert(state: EditorState, typeKey: string, target: BlockTarget, data?: Record<string, unknown>): {
    state: EditorState;
    id: string | null;
};
/** Swap a block for a fresh one of another type in the same position. */
export declare function replaceBlock(state: EditorState, id: string, typeKey: string): {
    state: EditorState;
    id: string | null;
};
export declare function remove(state: EditorState, id: string): EditorState;
export declare function move(state: EditorState, id: string, target: BlockTarget): EditorState;
export declare function duplicate(state: EditorState, id: string): EditorState;
export declare function updateData(state: EditorState, id: string, field: string, value: unknown): EditorState;
/**
 * An inline text edit: the data changes and the rendered node is patched in
 * place, so no server round trip is needed.
 */
export declare function updateBoundText(state: EditorState, id: string, field: string, value: string): EditorState;
export declare function updateBoundDocument(state: EditorState, id: string, field: string, document: Record<string, unknown> | null): EditorState;
export declare function updateStyle(state: EditorState, id: string, patch: Partial<BlockStyle>): EditorState;
export declare function setRendered(state: EditorState, id: string, node: Node, errors?: Record<string, string[]>): EditorState;
export declare function undo(state: EditorState): EditorState;
export declare function redo(state: EditorState): EditorState;
export declare function markSaving(state: EditorState): EditorState;
export declare function markSaved(state: EditorState, revision: number, errors: BlockErrors, savedDocument: BlockDocument): EditorState;
export declare function markConflict(state: EditorState, revision: number): EditorState;
/** Keep the local document and save it over the newer server revision. */
export declare function overwriteConflict(state: EditorState): EditorState;
export declare function markError(state: EditorState): EditorState;
export declare function markPublishing(state: EditorState, publishing: boolean): EditorState;
export declare function markPublished(state: EditorState, revision: number, published: BlockDocument): EditorState;
export declare function setErrors(state: EditorState, errors: BlockErrors): EditorState;
