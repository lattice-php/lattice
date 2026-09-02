import type { BlockDocument, BlockTypeData, SlotData } from "../types";
import { childrenOf, findBlock } from "./tree";

export function typeOf(types: readonly BlockTypeData[], key: string): BlockTypeData | null {
  return types.find((type) => type.type === key) ?? null;
}

export function slotRule(
  types: readonly BlockTypeData[],
  parentType: string,
  slot: string,
): SlotData | null {
  return typeOf(types, parentType)?.slots.find((candidate) => candidate.name === slot) ?? null;
}

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
export function canPlace({
  document,
  types,
  blockType,
  parentId,
  slot,
  movingId = null,
}: PlacementContext): boolean {
  if (parentId === null) {
    return true;
  }

  const parent = findBlock(document, parentId);

  if (!parent || slot === null) {
    return false;
  }

  const rule = slotRule(types, parent.node.type, slot);

  if (!rule) {
    return false;
  }

  if (rule.allows !== null && !rule.allows.includes(blockType)) {
    return false;
  }

  if (rule.max === null) {
    return true;
  }

  const children = childrenOf(document, parentId, slot);
  const occupied = children.filter((child) => child.id !== movingId).length;

  return occupied < rule.max;
}

export function allowedTypesFor(
  document: BlockDocument,
  types: readonly BlockTypeData[],
  parentId: string | null,
  slot: string | null,
): BlockTypeData[] {
  return types.filter((type) =>
    canPlace({ blockType: type.type, document, parentId, slot, types }),
  );
}
