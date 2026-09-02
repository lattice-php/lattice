import { BlockDocument, BlockTarget, BlockTypeData } from "../types";
/**
 * Where Alt+Arrow moves a block: one step among its siblings, and at the edge
 * of a slot out to the parent's own position so a block can leave a column
 * with the keyboard alone.
 */
export declare function keyboardMoveTarget(
  document: BlockDocument,
  types: readonly BlockTypeData[],
  id: string,
  direction: "up" | "down",
): BlockTarget | null;
