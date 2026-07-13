import {
  ROW_ID_KEY,
  type RepeaterRow,
} from "@lattice-php/lattice/form/components/fields/repeater-rows";
import type { RowTemplate } from "@lattice-php/lattice/form/components/fields/row-templates";

export type BlockStep = { index: number; slot?: string };
export type BlockPath = BlockStep[];

export function childList(row: RepeaterRow, slot: string): RepeaterRow[] {
  const slots = (row.slots ?? {}) as Record<string, RepeaterRow[]>;

  return Array.isArray(slots[slot]) ? slots[slot] : [];
}

export function withChildList(row: RepeaterRow, slot: string, list: RepeaterRow[]): RepeaterRow {
  const slots = { ...((row.slots ?? {}) as Record<string, RepeaterRow[]>), [slot]: list };

  return { ...row, slots };
}

export function getContainer(rows: RepeaterRow[], path: BlockPath): RepeaterRow[] | null {
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

export function replaceContainer(
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

export function blockAt(rows: RepeaterRow[], path: BlockPath): RepeaterRow | null {
  const container = getContainer(rows, path);
  const index = path[path.length - 1]?.index ?? -1;

  return container?.[index] ?? null;
}

export function updateBlockAt(
  rows: RepeaterRow[],
  path: BlockPath,
  field: string,
  value: unknown,
): RepeaterRow[] {
  const index = path[path.length - 1]?.index ?? -1;

  return replaceContainer(rows, path, (list) =>
    list.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
  );
}

function remintRowIds(row: RepeaterRow): RepeaterRow {
  const next: RepeaterRow = { ...row, [ROW_ID_KEY]: crypto.randomUUID() };
  const slots = row.slots as Record<string, RepeaterRow[]> | undefined;

  if (slots && typeof slots === "object") {
    next.slots = Object.fromEntries(
      Object.entries(slots).map(([slot, children]) => [
        slot,
        Array.isArray(children) ? children.map(remintRowIds) : children,
      ]),
    );
  }

  return next;
}

/** Insert a deep copy after the original; every copied row gets a fresh id. */
export function duplicateBlockAt(rows: RepeaterRow[], path: BlockPath): RepeaterRow[] {
  const index = path[path.length - 1]?.index ?? -1;

  return replaceContainer(rows, path, (list) => {
    const source = list[index];

    if (!source) {
      return list;
    }

    const next = [...list];
    next.splice(index + 1, 0, remintRowIds(source));

    return next;
  });
}

/** Move a block within its own container by the given offset, clamped at the edges. */
export function shiftBlockAt(rows: RepeaterRow[], path: BlockPath, delta: number): RepeaterRow[] {
  const index = path[path.length - 1]?.index ?? -1;

  return replaceContainer(rows, path, (list) => {
    const target = index + delta;

    if (index < 0 || index >= list.length || target < 0 || target >= list.length) {
      return list;
    }

    const next = [...list];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);

    return next;
  });
}

export function removeBlockAt(rows: RepeaterRow[], path: BlockPath): RepeaterRow[] {
  const index = path[path.length - 1]?.index ?? -1;

  return replaceContainer(rows, path, (list) => list.filter((_, i) => i !== index));
}

export function appendBlockAt(
  rows: RepeaterRow[],
  path: BlockPath,
  slot: string,
  row: RepeaterRow,
): RepeaterRow[] {
  const index = path[path.length - 1]?.index ?? -1;

  return replaceContainer(rows, path, (list) =>
    list.map((parent, i) =>
      i === index ? withChildList(parent, slot, [...childList(parent, slot), row]) : parent,
    ),
  );
}

/**
 * The block types the slot containing the given path accepts, or null when the
 * path is top-level or the slot is unrestricted.
 */
export function slotAllowedTypes(
  templates: RowTemplate[],
  rows: RepeaterRow[],
  path: BlockPath,
): string[] | null {
  if (path.length < 2) {
    return null;
  }

  const parentStep = path[path.length - 2];

  if (parentStep.slot === undefined) {
    return null;
  }

  const parent = blockAt(rows, [...path.slice(0, -2), { index: parentStep.index }]);
  const template = templates.find((candidate) => candidate.type === parent?.type);

  return template?.slots?.find((slot) => slot.name === parentStep.slot)?.blocks ?? null;
}

export type BlockWalkEntry = { row: RepeaterRow; path: BlockPath };

/** Every block in the tree, depth-first, with the path addressing it. */
export function walkBlocks(rows: RepeaterRow[], prefix: BlockPath = []): BlockWalkEntry[] {
  return rows.flatMap((row, index) => {
    const nested = Object.keys((row.slots ?? {}) as Record<string, unknown>).flatMap((slot) =>
      walkBlocks(childList(row, slot), [...prefix, { index, slot }]),
    );

    return [{ row, path: [...prefix, { index }] }, ...nested];
  });
}
