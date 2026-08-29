import { describe, expect, it } from "vitest";
import {
  appendColumn,
  cardsFor,
  createBoardState,
  getCardActions,
  getCardUrl,
  optimisticMove,
  replaceAll,
  replaceColumn,
  setColumnLoading,
} from "./board-store";
import { boardCard, boardColumnCards, boardResult } from "./test-support";
import type { BoardColumnData } from "./generated";

const columns: BoardColumnData[] = [
  { color: null, icon: null, key: "todo", label: "To Do" },
  { color: null, icon: null, key: "done", label: "Done" },
];

describe("replaceAll", () => {
  it("populates cards, order, and meta from every column in the result", () => {
    const state = replaceAll(
      createBoardState(columns),
      boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec"), boardCard(2, "Review PR")], {
          hasMore: true,
          total: 5,
        }),
        boardColumnCards("done", [boardCard(3, "Ship release")]),
      ]),
    );

    expect(cardsFor(state, "todo").map((card) => card.id)).toEqual([1, 2]);
    expect(cardsFor(state, "done").map((card) => card.id)).toEqual([3]);
    expect(state.meta.get("todo")).toEqual({ hasMore: true, loading: false, offset: 2, total: 5 });
    expect(state.meta.get("done")).toEqual({ hasMore: false, loading: false, offset: 1, total: 1 });
  });

  it("increments generation on every reload", () => {
    const initial = createBoardState(columns);
    const first = replaceAll(initial, boardResult([boardColumnCards("todo", [])]));
    const second = replaceAll(first, boardResult([boardColumnCards("todo", [])]));

    expect(first.generation).toBe(initial.generation + 1);
    expect(second.generation).toBe(first.generation + 1);
  });
});

describe("appendColumn", () => {
  it("appends new cards after the existing ones and updates hasMore/total/offset", () => {
    const loaded = replaceAll(
      createBoardState(columns),
      boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec")], { hasMore: true, total: 3 }),
      ]),
    );

    const appended = appendColumn(
      loaded,
      boardColumnCards("todo", [boardCard(2, "Review PR"), boardCard(3, "Plan release")], {
        hasMore: false,
        offset: 1,
        total: 3,
      }),
    );

    expect(cardsFor(appended, "todo").map((card) => card.id)).toEqual([1, 2, 3]);
    expect(appended.meta.get("todo")).toEqual({
      hasMore: false,
      loading: false,
      offset: 3,
      total: 3,
    });
  });

  it("dedupes by id instead of pushing a repeated card into the order a second time", () => {
    const loaded = replaceAll(
      createBoardState(columns),
      boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec")], { hasMore: true, total: 2 }),
      ]),
    );

    const appended = appendColumn(
      loaded,
      boardColumnCards("todo", [boardCard(1, "Write spec (updated)"), boardCard(2, "Review PR")], {
        hasMore: false,
        total: 2,
      }),
    );

    expect(cardsFor(appended, "todo").map((card) => card.id)).toEqual([1, 2]);
    expect(cardsFor(appended, "todo")[0]?.title).toBe("Write spec (updated)");
  });

  it("leaves generation untouched, unlike a full reload", () => {
    const loaded = replaceAll(
      createBoardState(columns),
      boardResult([boardColumnCards("todo", [])]),
    );
    const appended = appendColumn(loaded, boardColumnCards("todo", [boardCard(1, "Write spec")]));

    expect(appended.generation).toBe(loaded.generation);
  });
});

describe("setColumnLoading", () => {
  it("toggles only the targeted column", () => {
    const state = createBoardState(columns);
    const loading = setColumnLoading(state, "todo", true);

    expect(loading.meta.get("todo")?.loading).toBe(true);
    expect(loading.meta.get("done")?.loading).toBe(false);
  });
});

describe("optimisticMove", () => {
  const loaded = replaceAll(
    createBoardState(columns),
    boardResult([
      boardColumnCards("todo", [boardCard(1, "Write spec"), boardCard(2, "Review PR")], {
        total: 2,
      }),
      boardColumnCards("done", [boardCard(3, "Ship release")], { total: 1 }),
    ]),
  );

  it("reorders a card within its own column, leaving totals untouched", () => {
    const moved = optimisticMove(loaded, { cardId: "2", columnKey: "todo", position: 0 });

    expect(moved).not.toBeNull();
    expect(cardsFor(moved!, "todo").map((card) => card.id)).toEqual([2, 1]);
    expect(moved!.meta.get("todo")?.total).toBe(2);
  });

  it("moves a card across columns and adjusts both columns' totals", () => {
    const moved = optimisticMove(loaded, { cardId: "1", columnKey: "done", position: 0 });

    expect(moved).not.toBeNull();
    expect(cardsFor(moved!, "todo").map((card) => card.id)).toEqual([2]);
    expect(cardsFor(moved!, "done").map((card) => card.id)).toEqual([1, 3]);
    expect(moved!.meta.get("todo")?.total).toBe(1);
    expect(moved!.meta.get("done")?.total).toBe(2);
  });

  it("keeps offset in sync with order length after a cross-column move", () => {
    const moved = optimisticMove(loaded, { cardId: "1", columnKey: "done", position: 0 });

    expect(moved).not.toBeNull();
    expect(moved!.meta.get("todo")?.offset).toBe(cardsFor(moved!, "todo").length);
    expect(moved!.meta.get("done")?.offset).toBe(cardsFor(moved!, "done").length);
  });

  it("leaves offset untouched for a same-column reorder", () => {
    const moved = optimisticMove(loaded, { cardId: "2", columnKey: "todo", position: 0 });

    expect(moved).not.toBeNull();
    expect(moved!.meta.get("todo")?.offset).toBe(loaded.meta.get("todo")?.offset);
  });

  it("returns null for a drop back at the card's own position", () => {
    expect(optimisticMove(loaded, { cardId: "1", columnKey: "todo", position: 0 })).toBeNull();
  });

  it("returns null for an unknown card", () => {
    expect(optimisticMove(loaded, { cardId: "ghost", columnKey: "todo", position: 0 })).toBeNull();
  });

  it("returns null for an unknown destination column", () => {
    expect(optimisticMove(loaded, { cardId: "1", columnKey: "archived", position: 0 })).toBeNull();
  });

  it("marks moving cards as still present after the move", () => {
    const moved = optimisticMove(loaded, { cardId: "3", columnKey: "todo", position: 1 });

    expect(cardsFor(moved!, "done")).toEqual([]);
    expect(cardsFor(moved!, "todo").map((card) => card.id)).toEqual([1, 3, 2]);
  });
});

describe("replaceColumn", () => {
  it("replaces only the targeted column's cards, order, and meta", () => {
    const loaded = replaceAll(
      createBoardState(columns),
      boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec")], { hasMore: true, total: 3 }),
        boardColumnCards("done", [boardCard(9, "Ship release")], { total: 1 }),
      ]),
    );

    const replaced = replaceColumn(
      loaded,
      boardColumnCards("todo", [boardCard(1, "Write spec"), boardCard(2, "Fresh card")], {
        hasMore: false,
        total: 2,
      }),
    );

    expect(cardsFor(replaced, "todo").map((card) => card.id)).toEqual([1, 2]);
    expect(replaced.meta.get("todo")).toEqual({
      hasMore: false,
      loading: false,
      offset: 2,
      total: 2,
    });
    expect(cardsFor(replaced, "done").map((card) => card.id)).toEqual([9]);
  });

  it("leaves generation untouched, unlike a full reload", () => {
    const loaded = replaceAll(
      createBoardState(columns),
      boardResult([boardColumnCards("todo", [])]),
    );
    const replaced = replaceColumn(loaded, boardColumnCards("todo", [boardCard(1, "Write spec")]));

    expect(replaced.generation).toBe(loaded.generation);
  });
});

describe("getCardUrl", () => {
  it("reads a string cardUrl from the card payload", () => {
    expect(getCardUrl(boardCard(1, "Write spec", { cardUrl: "/tasks/1" }))).toBe("/tasks/1");
  });

  it("returns null when the card has no cardUrl", () => {
    expect(getCardUrl(boardCard(1, "Write spec"))).toBeNull();
  });
});

describe("getCardActions", () => {
  it("reads the card's action nodes", () => {
    const actions = [{ id: "delete", props: {}, type: "action" }];

    expect(getCardActions(boardCard(1, "Write spec", { actions }))).toBe(actions);
  });

  it("returns an empty array when the card has no actions", () => {
    expect(getCardActions(boardCard(1, "Write spec"))).toEqual([]);
  });
});
