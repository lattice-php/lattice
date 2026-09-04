import { BlockDocument, BlockNode, BlockTarget, BlockTypeData } from '../types';
export type BlockEntry = {
    node: BlockNode;
    parentId: string | null;
    slot: string | null;
    index: number;
    depth: number;
};
export declare function newBlockId(): string;
export declare function createBlock(type: BlockTypeData, id?: string): BlockNode;
export declare function flattenDocument(document: BlockDocument): BlockEntry[];
export declare function findBlock(document: BlockDocument, id: string): BlockEntry | null;
export declare function childrenOf(document: BlockDocument, parentId: string | null, slot: string | null): readonly BlockNode[];
export declare function updateBlock(document: BlockDocument, id: string, map: (node: BlockNode) => BlockNode): BlockDocument;
export declare function insertBlock(document: BlockDocument, block: BlockNode, target: BlockTarget): BlockDocument;
export declare function removeBlock(document: BlockDocument, id: string): BlockDocument;
export declare function moveBlock(document: BlockDocument, id: string, target: BlockTarget): BlockDocument;
export declare function cloneWithFreshIds(node: BlockNode): BlockNode;
export declare function duplicateBlock(document: BlockDocument, id: string): {
    document: BlockDocument;
    id: string | null;
};
/**
 * A block whose slots depend on its data (columns) may lose slots when the
 * data shrinks. Children of a slot that no longer renders move to the end of
 * the last remaining slot so nothing silently disappears.
 */
export declare function reconcileSlots(document: BlockDocument, id: string, presentSlots: readonly string[]): BlockDocument;
export declare function visibleOrder(document: BlockDocument): string[];
export declare function pathTo(document: BlockDocument, id: string): BlockEntry[];
/**
 * Blocks whose data differs between two documents (after undo/redo) so their
 * render can be refreshed; structural moves alone do not count.
 */
export declare function changedDataBlocks(previous: BlockDocument, next: BlockDocument): string[];
