import { ROW_ID_KEY, type RepeaterRow } from "@lattice-php/form/toolkit";

export const CHILDREN_KEY = "children";

export type TreeRow = RepeaterRow;

/** A path is the row index at each nesting level, e.g. [0, 2] = rows[0].children[2]. */
export type TreePath = number[];

export function childrenOf(row: TreeRow): TreeRow[] {
  const children = row[CHILDREN_KEY];
  return Array.isArray(children) ? (children as TreeRow[]) : [];
}

export function findPath(rows: TreeRow[], rowId: string, prefix: TreePath = []): TreePath | null {
  for (const [index, row] of rows.entries()) {
    if (row[ROW_ID_KEY] === rowId) {
      return [...prefix, index];
    }

    const nested = findPath(childrenOf(row), rowId, [...prefix, index]);
    if (nested) {
      return nested;
    }
  }

  return null;
}

export function rowAtPath(rows: TreeRow[], path: TreePath): TreeRow | null {
  let level = rows;
  let row: TreeRow | null = null;

  for (const index of path) {
    row = level[index] ?? null;
    if (!row) {
      return null;
    }
    level = childrenOf(row);
  }

  return row;
}

/** Levels a row's subtree occupies: a leaf is 1, a row with leaf children is 2. */
export function subtreeHeight(row: TreeRow): number {
  const children = childrenOf(row);
  return 1 + children.reduce((deepest, child) => Math.max(deepest, subtreeHeight(child)), 0);
}

function isSelfOrDescendant(sourcePath: TreePath, targetPath: TreePath): boolean {
  return (
    targetPath.length >= sourcePath.length &&
    sourcePath.every((index, level) => targetPath[level] === index)
  );
}

function updateLevel(
  rows: TreeRow[],
  parentPath: TreePath,
  fn: (level: TreeRow[]) => TreeRow[],
): TreeRow[] {
  if (parentPath.length === 0) {
    return fn(rows);
  }

  const [index, ...rest] = parentPath;
  return rows.map((row, i) =>
    i === index ? { ...row, [CHILDREN_KEY]: updateLevel(childrenOf(row), rest, fn) } : row,
  );
}

export function canPlace(
  rows: TreeRow[],
  sourceRowId: string,
  parentRowId: string | null,
  options: { maxDepth: number | null; acceptsChildren: (parent: TreeRow) => boolean },
): boolean {
  const sourcePath = findPath(rows, sourceRowId);
  const source = sourcePath ? rowAtPath(rows, sourcePath) : null;

  if (!sourcePath || !source) {
    return false;
  }

  let parentPath: TreePath = [];

  if (parentRowId !== null) {
    const path = findPath(rows, parentRowId);
    const parent = path ? rowAtPath(rows, path) : null;

    if (
      !path ||
      !parent ||
      isSelfOrDescendant(sourcePath, path) ||
      !options.acceptsChildren(parent)
    ) {
      return false;
    }

    parentPath = path;
  }

  return options.maxDepth === null || parentPath.length + subtreeHeight(source) <= options.maxDepth;
}

/**
 * Move a row (with its subtree) under the given parent at the given index,
 * immutably. The index refers to the sibling list before removal; it is
 * adjusted when the source leaves the same list at an earlier position.
 * Returns the input unchanged for impossible moves.
 */
export function moveNode(
  rows: TreeRow[],
  sourceRowId: string,
  parentRowId: string | null,
  index: number,
): TreeRow[] {
  const sourcePath = findPath(rows, sourceRowId);
  const source = sourcePath ? rowAtPath(rows, sourcePath) : null;

  if (!sourcePath || !source) {
    return rows;
  }

  let parentPath: TreePath = [];

  if (parentRowId !== null) {
    const path = findPath(rows, parentRowId);

    if (!path || isSelfOrDescendant(sourcePath, path)) {
      return rows;
    }

    parentPath = path;
  }

  const sourceParentPath = sourcePath.slice(0, -1);
  const sourceIndex = sourcePath[sourcePath.length - 1];
  const sameParent =
    sourceParentPath.length === parentPath.length &&
    sourceParentPath.every((value, level) => parentPath[level] === value);
  const insertionIndex = sameParent && sourceIndex < index ? index - 1 : index;

  const withoutSource = updateLevel(rows, sourceParentPath, (level) =>
    level.filter((_, i) => i !== sourceIndex),
  );

  const adjustedParentPath = [...parentPath];
  const branchLevel = sourceParentPath.length;
  if (
    parentPath.length > branchLevel &&
    sourceParentPath.every((value, level) => parentPath[level] === value) &&
    parentPath[branchLevel] > sourceIndex
  ) {
    adjustedParentPath[branchLevel] -= 1;
  }

  return updateLevel(withoutSource, adjustedParentPath, (level) => {
    const bounded = Math.max(0, Math.min(insertionIndex, level.length));
    return [...level.slice(0, bounded), source, ...level.slice(bounded)];
  });
}
