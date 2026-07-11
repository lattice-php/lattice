import {
  ROW_ID_KEY,
  type RepeaterRow,
} from "@lattice-php/lattice/form/components/fields/repeater-rows";
import { walkBlocks, type BlockPath } from "./tree";

/**
 * Drag identities are row ids: they stay stable while the tree mutates, unlike
 * position paths. Empty slots get a synthetic droppable id so blocks can be
 * dropped into them.
 */
const SLOT_DROP_PREFIX = "slot:";

export function slotDropId(parentRowId: string, slot: string): string {
  return `${SLOT_DROP_PREFIX}${parentRowId}:${slot}`;
}

function pathsByRowId(rows: RepeaterRow[]): Map<string, BlockPath> {
  return new Map(walkBlocks(rows).map(({ row, path }) => [String(row[ROW_ID_KEY]), path]));
}

function slotDropPath(paths: Map<string, BlockPath>, id: string): BlockPath | null {
  const separator = id.lastIndexOf(":");
  const parent = paths.get(id.slice(SLOT_DROP_PREFIX.length, separator));

  if (!parent) {
    return null;
  }

  const last = parent[parent.length - 1];

  return [...parent.slice(0, -1), { ...last, slot: id.slice(separator + 1) }, { index: 0 }];
}

export function resolveDrop(
  rows: RepeaterRow[],
  activeId: string,
  overId: string,
): { from: BlockPath; to: BlockPath } | null {
  const paths = pathsByRowId(rows);
  const from = paths.get(activeId);

  if (!from) {
    return null;
  }

  const to = overId.startsWith(SLOT_DROP_PREFIX)
    ? slotDropPath(paths, overId)
    : (paths.get(overId) ?? null);

  return to ? { from, to } : null;
}

/** How deep a droppable sits in the tree, so collisions prefer the most specific target. */
export function dropDepth(rows: RepeaterRow[], id: string): number {
  const paths = pathsByRowId(rows);

  if (id.startsWith(SLOT_DROP_PREFIX)) {
    return (slotDropPath(paths, id)?.length ?? 0) + 1;
  }

  return paths.get(id)?.length ?? 0;
}
