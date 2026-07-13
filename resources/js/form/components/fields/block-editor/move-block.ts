import type { RepeaterRow } from "@lattice-php/lattice/form/components/fields/repeater-rows";
import { getContainer, replaceContainer, type BlockPath, type BlockStep } from "./tree";

export type { BlockPath, BlockStep } from "./tree";

function sameStep(a: BlockStep, b: BlockStep): boolean {
  return a.index === b.index && a.slot === b.slot;
}

/** A target below the moved block itself would orphan the subtree into a cycle. */
function descendsIntoMoved(from: BlockPath, to: BlockPath): boolean {
  if (to.length < from.length) {
    return false;
  }

  for (let i = 0; i < from.length - 1; i++) {
    if (!sameStep(from[i], to[i])) {
      return false;
    }
  }

  const branch = to[from.length - 1];

  return branch.index === from[from.length - 1].index && branch.slot !== undefined;
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

  if (!source || fromIndex < 0 || fromIndex >= source.length || descendsIntoMoved(from, to)) {
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
