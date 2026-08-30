import { describe, expect, it } from "vitest";
import {
  boardCardDragData,
  boardDragSource,
  boardDropTarget,
  computeBoardDropIntent,
  BOARD_CARD_DRAG_TYPE,
  BOARD_COLUMN_DRAG_TYPE,
} from "./board-dnd";

describe("boardDragSource", () => {
  it("reads the card id and column key from a board card's own drag payload", () => {
    expect(boardDragSource(boardCardDragData({ columnKey: "todo", id: "1" }))).toEqual({
      columnKey: "todo",
      id: "1",
    });
  });

  it("rejects data from another drag type", () => {
    expect(boardDragSource({ cardId: "1", columnKey: "todo", type: "something-else" })).toBeNull();
  });
});

describe("boardDropTarget", () => {
  it("returns the innermost card target when a card and its column both matched", () => {
    const target = boardDropTarget([
      { data: { cardId: "2", columnKey: "todo", type: BOARD_CARD_DRAG_TYPE } },
      { data: { columnKey: "todo", type: BOARD_COLUMN_DRAG_TYPE } },
    ]);

    expect(target).toEqual({ cardId: "2", columnKey: "todo", edge: null, type: "card" });
  });

  it("falls back to the column target when no card was hit", () => {
    const target = boardDropTarget([{ data: { columnKey: "done", type: BOARD_COLUMN_DRAG_TYPE } }]);

    expect(target).toEqual({ columnKey: "done", type: "column" });
  });

  it("returns null for drop targets outside the board", () => {
    expect(boardDropTarget([{ data: { type: "unrelated" } }])).toBeNull();
  });
});

describe("computeBoardDropIntent", () => {
  const order = new Map([
    ["todo", ["a", "b", "c"]],
    ["doing", ["x"]],
    ["done", []],
  ]);

  it("reorders down within a column using the target's bottom edge", () => {
    const intent = computeBoardDropIntent(
      { columnKey: "todo", id: "a" },
      { cardId: "c", columnKey: "todo", edge: "bottom", type: "card" },
      order,
    );

    expect(intent).toEqual({ cardId: "a", columnKey: "todo", position: 2 });
  });

  it("reorders up within a column using the target's top edge", () => {
    const intent = computeBoardDropIntent(
      { columnKey: "todo", id: "c" },
      { cardId: "a", columnKey: "todo", edge: "top", type: "card" },
      order,
    );

    expect(intent).toEqual({ cardId: "c", columnKey: "todo", position: 0 });
  });

  it("moves a card across columns onto a card's bottom edge", () => {
    const intent = computeBoardDropIntent(
      { columnKey: "todo", id: "b" },
      { cardId: "x", columnKey: "doing", edge: "bottom", type: "card" },
      order,
    );

    expect(intent).toEqual({ cardId: "b", columnKey: "doing", position: 1 });
  });

  it("moves a card across columns onto a card's top edge", () => {
    const intent = computeBoardDropIntent(
      { columnKey: "todo", id: "b" },
      { cardId: "x", columnKey: "doing", edge: "top", type: "card" },
      order,
    );

    expect(intent).toEqual({ cardId: "b", columnKey: "doing", position: 0 });
  });

  it("appends at the end when dropped on an empty column", () => {
    const intent = computeBoardDropIntent(
      { columnKey: "todo", id: "a" },
      { columnKey: "done", type: "column" },
      order,
    );

    expect(intent).toEqual({ cardId: "a", columnKey: "done", position: 0 });
  });

  it("drops at the end of a non-empty column's empty space", () => {
    const intent = computeBoardDropIntent(
      { columnKey: "todo", id: "a" },
      { columnKey: "doing", type: "column" },
      order,
    );

    expect(intent).toEqual({ cardId: "a", columnKey: "doing", position: 1 });
  });

  it("resolves a same-column drop at the end to the position before itself", () => {
    const intent = computeBoardDropIntent(
      { columnKey: "todo", id: "c" },
      { columnKey: "todo", type: "column" },
      order,
    );

    expect(intent).toEqual({ cardId: "c", columnKey: "todo", position: 2 });
  });

  it("returns null when the card is dropped on itself", () => {
    const intent = computeBoardDropIntent(
      { columnKey: "todo", id: "a" },
      { cardId: "a", columnKey: "todo", edge: "bottom", type: "card" },
      order,
    );

    expect(intent).toBeNull();
  });

  it("returns null for an unrecognized destination column", () => {
    const intent = computeBoardDropIntent(
      { columnKey: "todo", id: "a" },
      { columnKey: "archived", type: "column" },
      order,
    );

    expect(intent).toBeNull();
  });

  it("returns null when the target card no longer exists in its column", () => {
    const intent = computeBoardDropIntent(
      { columnKey: "todo", id: "a" },
      { cardId: "ghost", columnKey: "todo", edge: "bottom", type: "card" },
      order,
    );

    expect(intent).toBeNull();
  });
});
