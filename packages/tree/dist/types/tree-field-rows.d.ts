import { RepeaterRow } from "@lattice-php/form/toolkit";
export declare const CHILDREN_KEY = "children";
export type TreeRow = RepeaterRow;
/** A path is the row index at each nesting level, e.g. [0, 2] = rows[0].children[2]. */
export type TreePath = number[];
export declare function childrenOf(row: TreeRow): TreeRow[];
export declare function findPath(
  rows: TreeRow[],
  rowId: string,
  prefix?: TreePath,
): TreePath | null;
export declare function rowAtPath(rows: TreeRow[], path: TreePath): TreeRow | null;
/** Levels a row's subtree occupies: a leaf is 1, a row with leaf children is 2. */
export declare function subtreeHeight(row: TreeRow): number;
export declare function canPlace(
  rows: TreeRow[],
  sourceRowId: string,
  parentRowId: string | null,
  options: {
    maxDepth: number | null;
    acceptsChildren: (parent: TreeRow) => boolean;
  },
): boolean;
/**
 * Move a row (with its subtree) under the given parent at the given index,
 * immutably. The index refers to the sibling list before removal; it is
 * adjusted when the source leaves the same list at an earlier position.
 * Returns the input unchanged for impossible moves.
 */
export declare function moveNode(
  rows: TreeRow[],
  sourceRowId: string,
  parentRowId: string | null,
  index: number,
): TreeRow[];
