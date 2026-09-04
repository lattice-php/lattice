import { BlockDocument, BlockTypeData, SlotData } from '../types';
export declare function typeOf(types: readonly BlockTypeData[], key: string): BlockTypeData | null;
export declare function slotRule(types: readonly BlockTypeData[], parentType: string, slot: string): SlotData | null;
export type PlacementContext = {
    document: BlockDocument;
    types: readonly BlockTypeData[];
    blockType: string;
    parentId: string | null;
    slot: string | null;
    /** The block being moved, so its own slot does not count it twice against `max`. */
    movingId?: string | null;
};
/**
 * Whether a block of `blockType` may live in the given slot. The root accepts
 * everything; a slot enforces its allowed types and its `max`.
 */
export declare function canPlace({ document, types, blockType, parentId, slot, movingId, }: PlacementContext): boolean;
export declare function allowedTypesFor(document: BlockDocument, types: readonly BlockTypeData[], parentId: string | null, slot: string | null): BlockTypeData[];
