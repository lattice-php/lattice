import { Edge, Input } from "@lattice-php/lattice/dnd";
import { BlockDocument, BlockTarget, BlockTypeData } from "../types";
export type DragSource =
  | {
      kind: "block";
      id: string;
      blockType: string;
    }
  | {
      kind: "library";
      blockType: string;
    };
export declare function blockDragData(id: string, blockType: string): Record<string, unknown>;
export declare function libraryDragData(blockType: string): Record<string, unknown>;
export declare function dragSourceOf(data: Record<string | symbol, unknown>): DragSource | null;
/** A drop onto a block: lands before or after it inside the block's own list. */
export declare function blockDropTargetData(
  blockId: string,
  hit: {
    element: Element;
    input: Input;
  },
): Record<string | symbol, unknown>;
export declare function dropEdgeOf(data: DropTargetData): Edge | null;
/** A drop onto a slot's free area: appends to that slot. */
export declare function slotDropTargetData(
  parentId: string | null,
  slot: string | null,
): Record<string | symbol, unknown>;
export type DropTargetData = Record<string | symbol, unknown>;
/**
 * Resolve the innermost drop target into an insertion point. A block target
 * yields the edge-relative index among its siblings; a slot target appends.
 */
export declare function resolveDropTarget(
  document: BlockDocument,
  targets: readonly {
    data: DropTargetData;
  }[],
  source: DragSource | null,
): BlockTarget | null;
export declare function dropAllowed(
  document: BlockDocument,
  types: readonly BlockTypeData[],
  source: DragSource,
  target: BlockTarget,
): boolean;
