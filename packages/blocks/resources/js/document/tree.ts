import type { BlockDocument, BlockNode, BlockStyle, BlockTarget, BlockTypeData } from "../types";

export type BlockEntry = {
  node: BlockNode;
  parentId: string | null;
  slot: string | null;
  index: number;
  depth: number;
};

export function emptyStyle(): BlockStyle {
  return {
    align: null,
    anchor: null,
    background: null,
    hideOnDesktop: false,
    hideOnMobile: false,
    marginBottom: null,
    marginTop: null,
    paddingBottom: null,
    paddingTop: null,
    width: null,
  };
}

export function newBlockId(): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).slice(2).padEnd(12, "0");

  return `b_${random.slice(0, 8)}`;
}

export function createBlock(type: BlockTypeData, id: string = newBlockId()): BlockNode {
  return { data: { ...type.defaults }, id, slots: {}, style: emptyStyle(), type: type.type };
}

export function flattenDocument(document: BlockDocument): BlockEntry[] {
  const entries: BlockEntry[] = [];

  const visit = (
    nodes: readonly BlockNode[],
    parentId: string | null,
    slot: string | null,
    depth: number,
  ) => {
    nodes.forEach((node, index) => {
      entries.push({ depth, index, node, parentId, slot });

      for (const [name, children] of Object.entries(node.slots)) {
        visit(children, node.id, name, depth + 1);
      }
    });
  };

  visit(document.blocks, null, null, 0);

  return entries;
}

export function findBlock(document: BlockDocument, id: string): BlockEntry | null {
  return flattenDocument(document).find((entry) => entry.node.id === id) ?? null;
}

export function childrenOf(
  document: BlockDocument,
  parentId: string | null,
  slot: string | null,
): readonly BlockNode[] {
  if (parentId === null) {
    return document.blocks;
  }

  const parent = findBlock(document, parentId);

  return parent && slot !== null ? (parent.node.slots[slot] ?? []) : [];
}

export function isDescendant(document: BlockDocument, ancestorId: string, id: string): boolean {
  const ancestor = findBlock(document, ancestorId);

  if (!ancestor) {
    return false;
  }

  return flattenDocument({ blocks: [ancestor.node], version: document.version }).some(
    (entry) => entry.node.id === id && entry.node.id !== ancestorId,
  );
}

function mapNodes(
  nodes: readonly BlockNode[],
  id: string,
  map: (node: BlockNode) => BlockNode,
): readonly BlockNode[] {
  let changed = false;
  const result = nodes.map((node) => {
    if (node.id === id) {
      const next = map(node);
      changed ||= next !== node;

      return next;
    }

    let slotsChanged = false;
    const slots: Record<string, BlockNode[]> = {};

    for (const [name, children] of Object.entries(node.slots)) {
      const next = mapNodes(children, id, map);
      slots[name] = next as BlockNode[];
      slotsChanged ||= next !== children;
    }

    if (!slotsChanged) {
      return node;
    }

    changed = true;

    return { ...node, slots };
  });

  return changed ? result : nodes;
}

export function updateBlock(
  document: BlockDocument,
  id: string,
  map: (node: BlockNode) => BlockNode,
): BlockDocument {
  const blocks = mapNodes(document.blocks, id, map);

  return blocks === document.blocks ? document : { ...document, blocks: blocks as BlockNode[] };
}

function withList(
  document: BlockDocument,
  target: { parentId: string | null; slot: string | null },
  map: (list: readonly BlockNode[]) => BlockNode[],
): BlockDocument {
  if (target.parentId === null) {
    return { ...document, blocks: map(document.blocks) };
  }

  const slot = target.slot;

  if (slot === null) {
    return document;
  }

  return updateBlock(document, target.parentId, (node) => ({
    ...node,
    slots: { ...node.slots, [slot]: map(node.slots[slot] ?? []) },
  }));
}

export function insertBlock(
  document: BlockDocument,
  block: BlockNode,
  target: BlockTarget,
): BlockDocument {
  return withList(document, target, (list) => {
    const index = Math.max(0, Math.min(target.index, list.length));

    return [...list.slice(0, index), block, ...list.slice(index)];
  });
}

export function removeBlock(document: BlockDocument, id: string): BlockDocument {
  const entry = findBlock(document, id);

  if (!entry) {
    return document;
  }

  return withList(document, entry, (list) => list.filter((node) => node.id !== id));
}

export function moveBlock(document: BlockDocument, id: string, target: BlockTarget): BlockDocument {
  const entry = findBlock(document, id);

  if (
    !entry ||
    (target.parentId !== null &&
      (target.parentId === id || isDescendant(document, id, target.parentId)))
  ) {
    return document;
  }

  const sameList = entry.parentId === target.parentId && entry.slot === target.slot;
  const index = sameList && target.index > entry.index ? target.index - 1 : target.index;

  return insertBlock(removeBlock(document, id), entry.node, { ...target, index });
}

function cloneWithFreshIds(node: BlockNode): BlockNode {
  const slots: Record<string, BlockNode[]> = {};

  for (const [name, children] of Object.entries(node.slots)) {
    slots[name] = children.map(cloneWithFreshIds);
  }

  return { ...node, id: newBlockId(), slots, style: { ...node.style, anchor: null } };
}

export function duplicateBlock(
  document: BlockDocument,
  id: string,
): { document: BlockDocument; id: string | null } {
  const entry = findBlock(document, id);

  if (!entry) {
    return { document, id: null };
  }

  const copy = cloneWithFreshIds(entry.node);

  return {
    document: insertBlock(document, copy, {
      index: entry.index + 1,
      parentId: entry.parentId,
      slot: entry.slot,
    }),
    id: copy.id,
  };
}

/**
 * A block whose slots depend on its data (columns) may lose slots when the
 * data shrinks. Children of a slot that no longer renders move to the end of
 * the last remaining slot so nothing silently disappears.
 */
export function reconcileSlots(
  document: BlockDocument,
  id: string,
  presentSlots: readonly string[],
): BlockDocument {
  if (presentSlots.length === 0) {
    return document;
  }

  return updateBlock(document, id, (node) => {
    const orphaned = Object.entries(node.slots).filter(
      ([name, children]) => !presentSlots.includes(name) && children.length > 0,
    );

    if (orphaned.length === 0) {
      return node;
    }

    const last = presentSlots[presentSlots.length - 1] as string;
    const slots: Record<string, BlockNode[]> = {};

    for (const name of presentSlots) {
      slots[name] = [...(node.slots[name] ?? [])];
    }

    for (const [, children] of orphaned) {
      (slots[last] as BlockNode[]).push(...children);
    }

    return { ...node, slots };
  });
}

export function visibleOrder(document: BlockDocument): string[] {
  return flattenDocument(document).map((entry) => entry.node.id);
}

export function pathTo(document: BlockDocument, id: string): BlockEntry[] {
  const entries = flattenDocument(document);
  const path: BlockEntry[] = [];
  let current = entries.find((entry) => entry.node.id === id) ?? null;

  while (current) {
    path.unshift(current);
    const parentId: string | null = current.parentId;
    current =
      parentId === null ? null : (entries.find((entry) => entry.node.id === parentId) ?? null);
  }

  return path;
}

/**
 * Blocks whose data differs between two documents (after undo/redo) so their
 * render can be refreshed; structural moves alone do not count.
 */
export function changedDataBlocks(previous: BlockDocument, next: BlockDocument): string[] {
  const before = new Map(
    flattenDocument(previous).map((entry) => [entry.node.id, entry.node.data]),
  );

  return flattenDocument(next)
    .filter((entry) => {
      const data = before.get(entry.node.id);

      return data === undefined || JSON.stringify(data) !== JSON.stringify(entry.node.data);
    })
    .map((entry) => entry.node.id);
}
