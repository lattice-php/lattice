import type { RepeaterRow } from "@lattice-php/lattice/form/components/fields/repeater-rows";

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

function sameStep(a: BlockStep, b: BlockStep): boolean {
  return a.index === b.index && a.slot === b.slot;
}

function adjustToForRemoval(from: BlockPath, to: BlockPath): BlockPath {
  const sourceDepth = from.length - 1;

  if (to.length <= sourceDepth) {
    return to;
  }

  for (let i = 0; i < sourceDepth; i++) {
    if (!sameStep(from[i], to[i])) {
      return to;
    }
  }

  if (to.length === sourceDepth + 1) {
    return to;
  }

  const fromIndex = from[sourceDepth].index;
  const toStep = to[sourceDepth];

  if (fromIndex >= toStep.index) {
    return to;
  }

  return [
    ...to.slice(0, sourceDepth),
    { ...toStep, index: toStep.index - 1 },
    ...to.slice(sourceDepth + 1),
  ];
}

export function moveBlock(rows: RepeaterRow[], from: BlockPath, to: BlockPath): RepeaterRow[] {
  const source = getContainer(rows, from);
  const fromIndex = from[from.length - 1]?.index ?? -1;

  if (!source || fromIndex < 0 || fromIndex >= source.length) {
    return rows;
  }

  const moved = source[fromIndex];

  const removed = replaceContainer(rows, from, (list) => list.filter((_, i) => i !== fromIndex));

  const adjustedTo = adjustToForRemoval(from, to);

  if (getContainer(removed, adjustedTo) === null) {
    return rows;
  }

  return replaceContainer(removed, adjustedTo, (list) => {
    const target = adjustedTo[adjustedTo.length - 1]?.index ?? list.length;
    const next = [...list];
    next.splice(Math.max(0, Math.min(target, next.length)), 0, moved);

    return next;
  });
}
