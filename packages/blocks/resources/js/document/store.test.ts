import { fakeNode } from "@lattice-php/core/test-support";
import { describe, expect, it } from "vitest";
import { block, columnsType, document, frameFor, testTypes } from "../test-support";
import {
  createEditorStore,
  duplicate,
  historyFlags,
  insert,
  markConflict,
  markSaved,
  move,
  redo,
  remove,
  select,
  setRendered,
  undo,
  updateData,
  updateStyle,
} from "./store";
import { findBlock } from "./tree";

function makeStore() {
  const doc = document(
    block("h", "lattice.heading", { text: "Hi" }),
    block(
      "c",
      columnsType.type,
      {},
      { col_1: [block("p", "lattice.paragraph", { text: "one" })], col_2: [] },
    ),
  );

  return createEditorStore({ document: doc, rendered: {}, revision: 3, types: testTypes });
}

describe("editor store", () => {
  it("inserts a block from its type defaults, selects it, and marks it stale for rendering", () => {
    const store = makeStore();
    const { state, id } = insert(store.getState(), "lattice.paragraph", {
      index: 0,
      parentId: "c",
      slot: "col_2",
    });

    expect(id).not.toBeNull();
    expect(state.selectedId).toBe(id);
    expect(state.staleIds).toEqual([id]);
    expect(state.saveState).toBe("dirty");
    expect(findBlock(state.document, id as string)?.slot).toBe("col_2");
  });

  it("refuses an insert or move the slot rules forbid", () => {
    const store = makeStore();
    const full = insert(
      insert(store.getState(), "lattice.paragraph", { index: 0, parentId: "c", slot: "col_2" })
        .state,
      "lattice.paragraph",
      {
        index: 0,
        parentId: "c",
        slot: "col_2",
      },
    ).state;

    expect(
      insert(full, "lattice.heading", { index: 0, parentId: "c", slot: "col_2" }).id,
    ).toBeNull();
    expect(move(full, "h", { index: 0, parentId: "c", slot: "col_2" })).toBe(full);
  });

  it("removes the selected block and clears the selection", () => {
    const store = makeStore();
    const state = remove(select(store.getState(), "p"), "p");

    expect(state.selectedId).toBeNull();
    expect(findBlock(state.document, "p")).toBeNull();
  });

  it("undoes coalesced typing as one step and re-requests renders for restored data", () => {
    const store = makeStore();
    let state = updateData(store.getState(), "h", "text", "Hel");
    state = updateData(state, "h", "text", "Hello");
    state = updateStyle(state, "h", { width: "wide" });

    expect(historyFlags(state)).toEqual({ canRedo: false, canUndo: true });

    state = undo(state);
    expect(findBlock(state.document, "h")?.node.style.width).toBeNull();
    expect(findBlock(state.document, "h")?.node.data.text).toBe("Hello");
    expect(state.staleIds).toEqual([]);

    state = undo(state);
    expect(findBlock(state.document, "h")?.node.data.text).toBe("Hi");
    expect(state.staleIds).toEqual(["h"]);
    expect(state.travelCount).toBe(2);

    state = redo(state);
    expect(findBlock(state.document, "h")?.node.data.text).toBe("Hello");
  });

  it("duplicates with the source render retargeted to the copy", () => {
    const store = makeStore();
    const rendered = frameFor(block("h", "lattice.heading"), [
      fakeNode({ props: { text: "Hi" }, type: "test.text" }),
    ]);
    const state = duplicate({ ...store.getState(), rendered: { h: rendered } }, "h");
    const copyId = state.selectedId as string;

    expect(copyId).not.toBe("h");
    expect(state.rendered[copyId]?.props).toMatchObject({ blockId: copyId });
    expect(state.document.blocks.map((node) => node.id)).toEqual(["h", copyId, "c"]);
  });

  it("reconciles slot children when a render drops a slot", () => {
    const store = makeStore();
    const columns = findBlock(store.getState().document, "c")?.node;
    const state = setRendered(store.getState(), "c", frameFor(columns as never, [], ["col_2"]), {});

    expect(findBlock(state.document, "c")?.node.slots).toEqual({
      col_2: [expect.objectContaining({ id: "p" })],
    });
    expect(state.rendered.c).toBeDefined();
  });

  it("tracks save state against the saved snapshot and keeps conflicts sticky", () => {
    const store = makeStore();
    const edited = updateData(store.getState(), "h", "text", "Yo");

    expect(markSaved(edited, 4, {}, edited.document).saveState).toBe("saved");
    expect(markSaved(updateData(edited, "p", "text", "x"), 4, {}, edited.document).saveState).toBe(
      "dirty",
    );

    const conflicted = markConflict(edited, 9);
    expect(updateData(conflicted, "h", "text", "again").saveState).toBe("conflict");
    expect(conflicted.revision).toBe(9);
  });
});
