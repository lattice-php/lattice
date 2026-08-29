import { describe, expect, it } from "vitest";
import {
  appendColumn,
  cardsFor,
  createBoardState,
  replaceAll,
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
