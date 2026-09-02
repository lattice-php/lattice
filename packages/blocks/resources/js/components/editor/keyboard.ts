import type { KeyboardEvent } from "react";
import { keyboardMoveTarget } from "../../dnd/keyboard-move";
import {
  duplicate,
  move,
  redo,
  remove,
  select,
  undo,
  type EditorStore,
} from "../../document/store";
import { visibleOrder } from "../../document/tree";

/** Inputs that own their own undo stack; inline editors on the canvas defer undo to the document. */
function inNativeUndoTarget(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;

  return (
    target !== null &&
    (["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) ||
      target.closest("[data-blocks-inspector]") !== null ||
      (target.isContentEditable && target.closest(".lt-blocks-canvas") === null))
  );
}

function inEditableTarget(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;

  return (
    target !== null &&
    (target.isContentEditable ||
      ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) ||
      target.closest("[data-blocks-inspector]") !== null)
  );
}

/**
 * The editor-wide shortcuts: undo/redo, select the neighbouring block, delete,
 * duplicate, and Alt+Arrow to move. Text controls keep their own keys.
 */
export function handleEditorKeyDown(
  event: KeyboardEvent,
  store: EditorStore,
  focusBlock: (id: string) => void,
): void {
  const meta = event.metaKey || event.ctrlKey;
  const key = event.key.toLowerCase();

  if (meta && key === "z" && !inNativeUndoTarget(event)) {
    event.preventDefault();
    store.setState(event.shiftKey ? redo : undo);

    return;
  }

  if (meta && key === "y" && !inNativeUndoTarget(event)) {
    event.preventDefault();
    store.setState(redo);

    return;
  }

  if (event.key === "Escape") {
    store.setState((state) => select(state, null));

    return;
  }

  if (inEditableTarget(event)) {
    return;
  }

  const state = store.getState();
  const selectedId = state.selectedId;

  if (selectedId === null) {
    return;
  }

  if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    store.setState((current) => remove(current, selectedId));

    return;
  }

  if (meta && event.shiftKey && key === "d") {
    event.preventDefault();
    store.setState((current) => duplicate(current, selectedId));

    return;
  }

  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();
    const direction = event.key === "ArrowUp" ? "up" : "down";

    if (event.altKey) {
      const target = keyboardMoveTarget(state.document, state.types, selectedId, direction);

      if (target) {
        store.setState((current) => move(current, selectedId, target));
        queueMicrotask(() => focusBlock(selectedId));
      }

      return;
    }

    const order = visibleOrder(state.document);
    const index = order.indexOf(selectedId);
    const nextId = order[direction === "up" ? index - 1 : index + 1];

    if (nextId !== undefined) {
      store.setState((current) => select(current, nextId));
      focusBlock(nextId);
    }
  }
}
