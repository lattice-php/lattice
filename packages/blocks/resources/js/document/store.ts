import type { Node } from "@lattice-php/core";
import type {
  BlockDocument,
  BlockErrors,
  BlockNode,
  BlockStyle,
  BlockTarget,
  BlockTypeData,
} from "../types";
import {
  canRedo,
  canUndo,
  createHistory,
  push,
  redo as redoHistory,
  undo as undoHistory,
  type History,
} from "./history";
import { canPlace, typeOf } from "./rules";
import {
  changedDataBlocks,
  createBlock,
  duplicateBlock,
  findBlock,
  insertBlock,
  moveBlock,
  reconcileSlots,
  removeBlock,
  updateBlock,
} from "./tree";

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "conflict" | "error";

export type EditorState = {
  document: BlockDocument;
  history: History<BlockDocument>;
  rendered: Record<string, Node>;
  types: readonly BlockTypeData[];
  selectedId: string | null;
  revision: number;
  saveState: SaveState;
  publishing: boolean;
  publishedAt: number | null;
  errors: BlockErrors;
  /** Blocks whose render no longer matches their data and must be fetched again. */
  staleIds: readonly string[];
  /** Bumped on undo/redo so inspector forms re-seed from the restored data. */
  travelCount: number;
};

export type EditorStore = {
  getState: () => EditorState;
  setState: (updater: (current: EditorState) => EditorState) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createEditorStore(initial: {
  document: BlockDocument;
  rendered: Record<string, Node>;
  types: readonly BlockTypeData[];
  revision: number;
}): EditorStore {
  let state: EditorState = {
    document: initial.document,
    errors: {},
    history: createHistory(initial.document),
    publishedAt: null,
    publishing: false,
    rendered: initial.rendered,
    revision: initial.revision,
    saveState: "idle",
    selectedId: null,
    staleIds: [],
    travelCount: 0,
    types: initial.types,
  };
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (updater) => {
      const next = updater(state);

      if (next === state) {
        return;
      }

      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function commit(
  state: EditorState,
  document: BlockDocument,
  coalesceKey: string | null = null,
  staleIds: readonly string[] = [],
): EditorState {
  if (document === state.document) {
    return state;
  }

  return {
    ...state,
    document,
    history: push(state.history, document, { coalesceKey }),
    saveState: state.saveState === "conflict" ? "conflict" : "dirty",
    staleIds: staleIds.length === 0 ? state.staleIds : [...state.staleIds, ...staleIds],
  };
}

export function select(state: EditorState, id: string | null): EditorState {
  return state.selectedId === id ? state : { ...state, selectedId: id };
}

export function insert(
  state: EditorState,
  typeKey: string,
  target: BlockTarget,
): { state: EditorState; id: string | null } {
  const type = typeOf(state.types, typeKey);

  if (
    !type ||
    !canPlace({
      blockType: typeKey,
      document: state.document,
      parentId: target.parentId,
      slot: target.slot,
      types: state.types,
    })
  ) {
    return { id: null, state };
  }

  const block = createBlock(type);
  const document = insertBlock(state.document, block, target);

  return {
    id: block.id,
    state: { ...commit(state, document, null, [block.id]), selectedId: block.id },
  };
}

export function remove(state: EditorState, id: string): EditorState {
  const document = removeBlock(state.document, id);
  const next = commit(state, document);

  return next.selectedId === id ? { ...next, selectedId: null } : next;
}

export function move(state: EditorState, id: string, target: BlockTarget): EditorState {
  const entry = findBlock(state.document, id);

  if (!entry) {
    return state;
  }

  const allowed = canPlace({
    blockType: entry.node.type,
    document: state.document,
    movingId: id,
    parentId: target.parentId,
    slot: target.slot,
    types: state.types,
  });

  return allowed ? commit(state, moveBlock(state.document, id, target)) : state;
}

export function duplicate(state: EditorState, id: string): EditorState {
  const result = duplicateBlock(state.document, id);

  if (result.id === null) {
    return state;
  }

  const copy = findBlock(result.document, result.id);
  const rendered = { ...state.rendered };
  const source = state.rendered[id];

  if (copy && source) {
    rendered[result.id] = retargetRendered(source, result.id);
  }

  const staleIds = copy ? descendantIds(copy.node).filter((childId) => childId !== result.id) : [];

  return { ...commit(state, result.document, null, staleIds), rendered, selectedId: result.id };
}

function descendantIds(node: BlockNode): string[] {
  return [node.id, ...Object.values(node.slots).flat().flatMap(descendantIds)];
}

function retargetRendered(node: Node, blockId: string): Node {
  return { ...node, props: { ...node.props, blockId } };
}

export function updateData(
  state: EditorState,
  id: string,
  field: string,
  value: unknown,
): EditorState {
  const document = updateBlock(state.document, id, (node) => ({
    ...node,
    data: { ...node.data, [field]: value },
  }));

  return commit(state, document, `data:${id}:${field}`);
}

export function replaceData(
  state: EditorState,
  id: string,
  data: Record<string, unknown>,
): EditorState {
  return commit(
    state,
    updateBlock(state.document, id, (node) => ({ ...node, data })),
    `data:${id}`,
  );
}

export function updateStyle(
  state: EditorState,
  id: string,
  patch: Partial<BlockStyle>,
): EditorState {
  const document = updateBlock(state.document, id, (node) => ({
    ...node,
    style: { ...node.style, ...patch },
  }));

  return commit(state, document, `style:${id}:${Object.keys(patch).join(",")}`);
}

export function setRendered(
  state: EditorState,
  id: string,
  node: Node,
  errors?: Record<string, string[]>,
): EditorState {
  const presentSlots = slotNamesIn(node);
  const document = reconcileSlots(state.document, id, presentSlots);
  const nextErrors = { ...state.errors };

  if (errors && Object.keys(errors).length > 0) {
    nextErrors[id] = errors;
  } else {
    delete nextErrors[id];
  }

  const next: EditorState = {
    ...state,
    errors: nextErrors,
    rendered: { ...state.rendered, [id]: node },
    staleIds: state.staleIds.filter((staleId) => staleId !== id),
  };

  return document === state.document ? next : commit(next, document, `slots:${id}`);
}

export function slotNamesIn(node: Node): string[] {
  const names: string[] = [];

  const visit = (candidate: Node) => {
    if (candidate.type === "blocks.slot") {
      const name = (candidate.props as { name?: unknown } | undefined)?.name;

      if (typeof name === "string") {
        names.push(name);
      }

      return;
    }

    candidate.schema?.forEach(visit);
  };

  node.schema?.forEach(visit);

  return names;
}

export function undo(state: EditorState): EditorState {
  return travel(state, undoHistory(state.history));
}

export function redo(state: EditorState): EditorState {
  return travel(state, redoHistory(state.history));
}

function travel(state: EditorState, history: History<BlockDocument>): EditorState {
  if (history === state.history) {
    return state;
  }

  const stale = changedDataBlocks(state.document, history.present);
  const selectedStillExists =
    state.selectedId !== null && findBlock(history.present, state.selectedId) !== null;

  return {
    ...state,
    document: history.present,
    history,
    saveState: state.saveState === "conflict" ? "conflict" : "dirty",
    selectedId: selectedStillExists ? state.selectedId : null,
    staleIds: [...state.staleIds, ...stale],
    travelCount: state.travelCount + 1,
  };
}

export function historyFlags(state: EditorState): { canUndo: boolean; canRedo: boolean } {
  return { canRedo: canRedo(state.history), canUndo: canUndo(state.history) };
}

export function markSaving(state: EditorState): EditorState {
  return { ...state, saveState: "saving" };
}

export function markSaved(
  state: EditorState,
  revision: number,
  errors: BlockErrors,
  savedDocument: BlockDocument,
): EditorState {
  return {
    ...state,
    errors,
    revision,
    saveState: state.document === savedDocument ? "saved" : "dirty",
  };
}

export function markConflict(state: EditorState, revision: number): EditorState {
  return { ...state, revision, saveState: "conflict" };
}

export function markError(state: EditorState): EditorState {
  return { ...state, saveState: "error" };
}

export function markPublishing(state: EditorState, publishing: boolean): EditorState {
  return { ...state, publishing };
}

export function markPublished(state: EditorState, revision: number): EditorState {
  return { ...state, publishedAt: Date.now(), publishing: false, revision, saveState: "saved" };
}

export function setErrors(state: EditorState, errors: BlockErrors): EditorState {
  return { ...state, errors };
}
