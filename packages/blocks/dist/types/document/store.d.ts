import { Node } from "@lattice-php/core";
import { BlockDocument, BlockErrors, BlockStyle, BlockTarget, BlockTypeData } from "../types";
import { History } from "./history";
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
export declare function createEditorStore(initial: {
  document: BlockDocument;
  rendered: Record<string, Node>;
  types: readonly BlockTypeData[];
  revision: number;
}): EditorStore;
export declare function select(state: EditorState, id: string | null): EditorState;
export declare function insert(
  state: EditorState,
  typeKey: string,
  target: BlockTarget,
): {
  state: EditorState;
  id: string | null;
};
export declare function remove(state: EditorState, id: string): EditorState;
export declare function move(state: EditorState, id: string, target: BlockTarget): EditorState;
export declare function duplicate(state: EditorState, id: string): EditorState;
export declare function updateData(
  state: EditorState,
  id: string,
  field: string,
  value: unknown,
): EditorState;
export declare function replaceData(
  state: EditorState,
  id: string,
  data: Record<string, unknown>,
): EditorState;
export declare function updateStyle(
  state: EditorState,
  id: string,
  patch: Partial<BlockStyle>,
): EditorState;
export declare function setRendered(
  state: EditorState,
  id: string,
  node: Node,
  errors?: Record<string, string[]>,
): EditorState;
export declare function slotNamesIn(node: Node): string[];
export declare function undo(state: EditorState): EditorState;
export declare function redo(state: EditorState): EditorState;
export declare function historyFlags(state: EditorState): {
  canUndo: boolean;
  canRedo: boolean;
};
export declare function markSaving(state: EditorState): EditorState;
export declare function markSaved(
  state: EditorState,
  revision: number,
  errors: BlockErrors,
  savedDocument: BlockDocument,
): EditorState;
export declare function markConflict(state: EditorState, revision: number): EditorState;
export declare function markError(state: EditorState): EditorState;
export declare function markPublishing(state: EditorState, publishing: boolean): EditorState;
export declare function markPublished(state: EditorState, revision: number): EditorState;
export declare function setErrors(state: EditorState, errors: BlockErrors): EditorState;
