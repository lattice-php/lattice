import { fakeNode } from "@lattice-php/core/test-support";
import { describe, expect, it } from "vitest";
import {
  block,
  columnsType,
  document,
  frameFor,
  headingFrame,
  testPatterns,
  testTypes,
  textOnlySectionType,
} from "../test-support";
import {
  createEditorStore,
  duplicate,
  insert,
  insertPattern,
  insertTargetFor,
  markConflict,
  markPublished,
  markSaved,
  move,
  overwriteConflict,
  setCanvasWidth,
  redo,
  remove,
  replaceBlock,
  seedDocument,
  select,
  setRendered,
  undo,
  updateBoundText,
  updateData,
  updateStyle,
} from "./store";
import { findBlock } from "./tree";
import type { BlockNode } from "../types";

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

  return createEditorStore({
    document: doc,
    patterns: testPatterns,
    rendered: {},
    revision: 3,
    seedType: "lattice.paragraph",
    types: testTypes,
  });
}

describe("editor store", () => {
  it("inserts a pattern with fresh ids at the target and marks every new block stale", () => {
    const store = makeStore();
    const { state, ids } = insertPattern(store.getState(), "intro", {
      index: 1,
      parentId: null,
      slot: null,
    });

    expect(ids).toHaveLength(2);
    expect(ids).not.toContain("tpl_h");
    expect(state.document.blocks.map((node) => node.id)).toEqual(["h", ...ids, "c"]);
    expect(state.document.blocks[1]?.data).toEqual({ text: "Pattern heading" });
    expect(state.staleIds).toEqual(ids);
    expect(state.selectedId).toBe(ids[0]);
    expect(state.saveState).toBe("dirty");

    const again = insertPattern(state, "intro", { index: 0, parentId: null, slot: null });
    expect(again.ids).not.toEqual(ids);
  });

  it("refuses a pattern whose root blocks the target slot does not accept", () => {
    const store = makeStore();
    const withSection = insert(store.getState(), textOnlySectionType.type, {
      index: 2,
      parentId: null,
      slot: null,
    });
    const sectionId = withSection.id as string;

    const refused = insertPattern(withSection.state, "intro", {
      index: 0,
      parentId: sectionId,
      slot: "content",
    });
    const unknown = insertPattern(withSection.state, "missing", {
      index: 0,
      parentId: null,
      slot: null,
    });

    expect(refused.ids).toEqual([]);
    expect(refused.state).toBe(withSection.state);
    expect(unknown.state).toBe(withSection.state);
  });

  it("places a library insertion after the selection only when every type fits there", () => {
    const store = makeStore();
    const selectedParagraph = select(store.getState(), "p");

    expect(insertTargetFor(selectedParagraph, ["lattice.heading"])).toEqual({
      index: 1,
      parentId: "c",
      slot: "col_1",
    });

    const withSection = insert(store.getState(), textOnlySectionType.type, {
      index: 2,
      parentId: null,
      slot: null,
    });
    const inSection = insert(withSection.state, "lattice.paragraph", {
      index: 0,
      parentId: withSection.id as string,
      slot: "content",
    });

    expect(insertTargetFor(inSection.state, ["lattice.paragraph"])).toEqual({
      index: 1,
      parentId: withSection.id,
      slot: "content",
    });
    expect(insertTargetFor(inSection.state, ["lattice.paragraph", "lattice.heading"])).toEqual({
      index: 3,
      parentId: null,
      slot: null,
    });
    expect(insertTargetFor(select(store.getState(), null), ["lattice.heading"])).toEqual({
      index: 2,
      parentId: null,
      slot: null,
    });
  });

  it("switches the canvas width and resumes saving after an overwrite decision", () => {
    const store = makeStore();

    expect(store.getState().canvasWidth).toBe("desktop");
    const narrow = setCanvasWidth(store.getState(), "mobile");
    expect(narrow.canvasWidth).toBe("mobile");
    expect(setCanvasWidth(narrow, "mobile")).toBe(narrow);

    const conflicted = markConflict(store.getState(), 9);
    const resumed = overwriteConflict(conflicted);
    expect(resumed.saveState).toBe("dirty");
    expect(resumed.revision).toBe(9);
    expect(overwriteConflict(store.getState())).toBe(store.getState());
  });

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

    expect(state.history.past).toHaveLength(2);
    expect(state.history.future).toHaveLength(0);

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

  it("points the copied slot outlets at the copy so its columns show their own children", () => {
    const store = makeStore();
    const columns = findBlock(store.getState().document, "c")?.node as BlockNode;
    const rendered = frameFor(columns, [], ["col_1", "col_2"]);
    const state = duplicate({ ...store.getState(), rendered: { c: rendered } }, "c");
    const copyId = state.selectedId as string;
    const copy = findBlock(state.document, copyId)?.node as BlockNode;
    const slots = state.rendered[copyId]?.schema ?? [];

    expect(slots.map((slot) => slot.props?.blockId)).toEqual([copyId, copyId]);
    expect(slots.map((slot) => slot.key)).toEqual([`${copyId}-col_1`, `${copyId}-col_2`]);
    expect(copy.slots.col_1?.[0]?.id).not.toBe("p");
    expect(state.staleIds).toEqual([copy.slots.col_1?.[0]?.id]);
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

  it("keeps edits made while publishing unsaved once the publish lands", () => {
    const store = makeStore();
    const sent = updateData(store.getState(), "h", "text", "Yo");
    const typedMeanwhile = updateData(sent, "h", "text", "Yo!");

    expect(markPublished(sent, 5, sent.document)).toMatchObject({
      publishing: false,
      revision: 5,
      saveState: "saved",
    });
    expect(markPublished(typedMeanwhile, 5, sent.document).saveState).toBe("dirty");
  });
});

describe("inline editing transitions", () => {
  it("seeds an empty document with the editor's seed block so typing can start", () => {
    const seeded = seedDocument(document(), testTypes, "lattice.paragraph");

    expect(seeded.blocks).toHaveLength(1);
    expect(seeded.blocks[0]?.type).toBe("lattice.paragraph");
    expect(seedDocument(document(), testTypes, "lattice.heading").blocks[0]?.type).toBe(
      "lattice.heading",
    );
    expect(
      seedDocument(document(block("h", "lattice.heading")), testTypes, "lattice.paragraph").blocks,
    ).toHaveLength(1);
    expect(seedDocument(document(), [columnsType], "lattice.paragraph").blocks).toHaveLength(0);
    expect(seedDocument(document(), testTypes, null).blocks).toHaveLength(0);
  });

  it("patches a bound text into the render without marking the block stale", () => {
    const store = makeStore();
    const rendered = headingFrame(block("h", "lattice.heading", { text: "Hi" }));
    const withRender = setRendered(store.getState(), "h", rendered);

    const state = updateBoundText(withRender, "h", "text", "Hello");

    expect(findBlock(state.document, "h")?.node.data.text).toBe("Hello");
    const heading = state.rendered.h?.schema?.[0]?.props as { text: string };

    expect(heading.text).toBe("Hello");
    expect(state.staleIds).not.toContain("h");
    expect(state.saveState).toBe("dirty");
  });

  it("replaces a block with another type in the same position and marks it for rendering", () => {
    const store = makeStore();
    const { state, id } = replaceBlock(store.getState(), "h", "lattice.paragraph");

    expect(id).not.toBeNull();
    expect(state.document.blocks.map((entry) => entry.type)).toEqual([
      "lattice.paragraph",
      columnsType.type,
    ]);
    expect(state.selectedId).toBe(id);
    expect(state.staleIds).toContain(id);
    expect(findBlock(state.document, "h")).toBeNull();
  });

  it("refuses to replace a block with a type the slot forbids", () => {
    const doc = document(
      block(
        "s",
        textOnlySectionType.type,
        {},
        {
          content: [block("p", "lattice.paragraph")],
        },
      ),
    );
    const store = createEditorStore({
      document: doc,
      rendered: {},
      revision: 1,
      seedType: "lattice.paragraph",
      types: testTypes,
    });

    const { state, id } = replaceBlock(store.getState(), "p", "lattice.heading");

    expect(id).toBeNull();
    expect(state).toBe(store.getState());
  });

  it("inserts a block with data on top of its type defaults", () => {
    const store = makeStore();
    const { state, id } = insert(
      store.getState(),
      "lattice.paragraph",
      { index: 0, parentId: null, slot: null },
      { content: { content: [], type: "doc" } },
    );

    expect(findBlock(state.document, id as string)?.node.data.content).toEqual({
      content: [],
      type: "doc",
    });
  });
});
