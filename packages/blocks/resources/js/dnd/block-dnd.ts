import {
  attachClosestEdge,
  extractClosestEdge,
  getReorderDestinationIndex,
} from "@lattice-php/lattice/dnd";
import type { Edge, Input } from "@lattice-php/lattice/dnd";
import { canPlace } from "../document/rules";
import { findBlock } from "../document/tree";
import type { BlockDocument, BlockTarget, BlockTypeData } from "../types";

export const BLOCK_DRAG_TYPE = "lattice-blocks/block";
export const LIBRARY_DRAG_TYPE = "lattice-blocks/library";

export type DragSource =
  | { kind: "block"; id: string; blockType: string }
  | { kind: "library"; blockType: string };

export function blockDragData(id: string, blockType: string): Record<string, unknown> {
  return { blockType, id, type: BLOCK_DRAG_TYPE };
}

export function libraryDragData(blockType: string): Record<string, unknown> {
  return { blockType, type: LIBRARY_DRAG_TYPE };
}

export function dragSourceOf(data: Record<string | symbol, unknown>): DragSource | null {
  if (
    data.type === BLOCK_DRAG_TYPE &&
    typeof data.id === "string" &&
    typeof data.blockType === "string"
  ) {
    return { blockType: data.blockType, id: data.id, kind: "block" };
  }

  if (data.type === LIBRARY_DRAG_TYPE && typeof data.blockType === "string") {
    return { blockType: data.blockType, kind: "library" };
  }

  return null;
}

/** A drop onto a block: lands before or after it inside the block's own list. */
export function blockDropTargetData(
  blockId: string,
  hit: { element: Element; input: Input },
): Record<string | symbol, unknown> {
  const data = attachClosestEdge(
    { blockId, kind: "block" },
    { allowedEdges: ["top", "bottom"], element: hit.element, input: hit.input },
  );

  return { ...data, edge: extractClosestEdge(data) };
}

export function dropEdgeOf(data: DropTargetData): Edge | null {
  return data.edge === "top" || data.edge === "bottom" ? data.edge : null;
}

/** A drop onto a slot's free area: appends to that slot. */
export function slotDropTargetData(
  parentId: string | null,
  slot: string | null,
): Record<string | symbol, unknown> {
  return { kind: "slot", parentId, slot };
}

export type DropTargetData = Record<string | symbol, unknown>;

/**
 * Resolve the innermost drop target into an insertion point. A block target
 * yields the edge-relative index among its siblings; a slot target appends.
 */
export function resolveDropTarget(
  document: BlockDocument,
  targets: readonly { data: DropTargetData }[],
  source: DragSource | null,
): BlockTarget | null {
  const target = targets[0];

  if (!target) {
    return null;
  }

  if (target.data.kind === "block" && typeof target.data.blockId === "string") {
    const entry = findBlock(document, target.data.blockId);

    if (!entry) {
      return null;
    }

    const edge = dropEdgeOf(target.data);
    const list = { parentId: entry.parentId, slot: entry.slot };
    const sourceEntry = source?.kind === "block" ? findBlock(document, source.id) : null;
    const sameList =
      sourceEntry !== null &&
      sourceEntry !== undefined &&
      sourceEntry.parentId === list.parentId &&
      sourceEntry.slot === list.slot;

    if (sameList && sourceEntry) {
      const index = getReorderDestinationIndex({
        axis: "vertical",
        closestEdgeOfTarget: edge,
        indexOfTarget: entry.index,
        startIndex: sourceEntry.index,
      });

      return { ...list, index: index > sourceEntry.index ? index + 1 : index };
    }

    return { ...list, index: edge === "bottom" ? entry.index + 1 : entry.index };
  }

  if (target.data.kind === "slot") {
    const parentId = typeof target.data.parentId === "string" ? target.data.parentId : null;
    const slot = typeof target.data.slot === "string" ? target.data.slot : null;
    const count =
      parentId === null
        ? document.blocks.length
        : (findBlock(document, parentId)?.node.slots[slot ?? ""]?.length ?? 0);

    return { index: count, parentId, slot };
  }

  return null;
}

export function dropAllowed(
  document: BlockDocument,
  types: readonly BlockTypeData[],
  source: DragSource,
  target: BlockTarget,
): boolean {
  return canPlace({
    blockType: source.blockType,
    document,
    movingId: source.kind === "block" ? source.id : null,
    parentId: target.parentId,
    slot: target.slot,
    types,
  });
}
