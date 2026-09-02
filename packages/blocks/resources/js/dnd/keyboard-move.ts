import { canPlace } from "../document/rules";
import { findBlock } from "../document/tree";
import type { BlockDocument, BlockTarget, BlockTypeData } from "../types";

/**
 * Where Alt+Arrow moves a block: one step among its siblings, and at the edge
 * of a slot out to the parent's own position so a block can leave a column
 * with the keyboard alone.
 */
export function keyboardMoveTarget(
  document: BlockDocument,
  types: readonly BlockTypeData[],
  id: string,
  direction: "up" | "down",
): BlockTarget | null {
  const entry = findBlock(document, id);

  if (!entry) {
    return null;
  }

  const siblings =
    entry.parentId === null
      ? document.blocks
      : (findBlock(document, entry.parentId)?.node.slots[entry.slot ?? ""] ?? []);
  const delta = direction === "up" ? -1 : 1;
  const next = entry.index + delta;

  if (next >= 0 && next < siblings.length) {
    return {
      index: direction === "up" ? next : next + 1,
      parentId: entry.parentId,
      slot: entry.slot,
    };
  }

  if (entry.parentId === null) {
    return null;
  }

  const parent = findBlock(document, entry.parentId);

  if (!parent) {
    return null;
  }

  const target: BlockTarget = {
    index: direction === "up" ? parent.index : parent.index + 1,
    parentId: parent.parentId,
    slot: parent.slot,
  };

  return canPlace({
    blockType: entry.node.type,
    document,
    movingId: id,
    parentId: target.parentId,
    slot: target.slot,
    types,
  })
    ? target
    : null;
}
