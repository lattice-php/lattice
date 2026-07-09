import type { RepeaterRow } from "../repeater-rows";

export type BlockStep = { index: number; slot?: string };
export type BlockPath = BlockStep[];

function childList(row: RepeaterRow, slot: string): RepeaterRow[] {
  const slots = (row.slots ?? {}) as Record<string, RepeaterRow[]>;

  return Array.isArray(slots[slot]) ? slots[slot] : [];
}

function withChildList(row: RepeaterRow, slot: string, list: RepeaterRow[]): RepeaterRow {
  const slots = { ...((row.slots ?? {}) as Record<string, RepeaterRow[]>), [slot]: list };

  return { ...row, slots };
}

function getContainer(rows: RepeaterRow[], path: BlockPath): RepeaterRow[] | null {
  let list = rows;

  for (let i = 0; i < path.length - 1; i++) {
    const step = path[i];
    const parent = list[step.index];

    if (!parent || step.slot === undefined) {
      return null;
    }

    list = childList(parent, step.slot);
  }

  return list;
}

function replaceContainer(
  rows: RepeaterRow[],
  path: BlockPath,
  update: (list: RepeaterRow[]) => RepeaterRow[],
): RepeaterRow[] {
  if (path.length <= 1) {
    return update(rows);
  }

  const [head, ...rest] = path;
  const slot = head.slot;

  if (slot === undefined) {
    return rows;
  }

  return rows.map((row, i) =>
    i === head.index
      ? withChildList(row, slot, replaceContainer(childList(row, slot), rest, update))
      : row,
  );
}

export function moveBlock(rows: RepeaterRow[], from: BlockPath, to: BlockPath): RepeaterRow[] {
  const source = getContainer(rows, from);
  const fromIndex = from[from.length - 1]?.index ?? -1;

  if (!source || fromIndex < 0 || fromIndex >= source.length) {
    return rows;
  }

  const moved = source[fromIndex];

  const removed = replaceContainer(rows, from, (list) => list.filter((_, i) => i !== fromIndex));

  // Adjust the "to" path if we removed a top-level element that shifts subsequent indices
  // Only adjust if "to" has multiple steps (navigating into a nested container)
  let adjustedTo = to;
  if (from.length === 1 && to.length > 1) {
    const removedIndex = from[0].index;
    if (to[0].index > removedIndex) {
      adjustedTo = [{ ...to[0], index: to[0].index - 1 }, ...to.slice(1)];
    }
  }

  return replaceContainer(removed, adjustedTo, (list) => {
    const target = adjustedTo[adjustedTo.length - 1]?.index ?? list.length;
    const next = [...list];
    next.splice(Math.max(0, Math.min(target, next.length)), 0, moved);

    return next;
  });
}
