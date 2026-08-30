import { page, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { fakeNode } from "@lattice-php/core/test-support";
import BoardAdapter from "./components/board/board-adapter";
import {
  boardCard,
  boardColumn,
  boardColumnCards,
  boardResult,
  cardTemplate,
  moveAction,
  stubMoveFetch,
  testRegistry,
} from "./test-support";

function renderBoard(props: Record<string, unknown>) {
  const node = fakeNode({
    id: "move-board",
    props: {
      columns: [],
      endpoint: null,
      filters: [],
      moveAction,
      perColumn: 25,
      query: { q: "", tf: {} },
      queryKey: null,
      ref: null,
      result: null,
      searchable: false,
      syncQuery: false,
      ...props,
    },
    schema: cardTemplate,
    type: "board",
  });

  return renderWithRegistry(<BoardAdapter node={node}>{null}</BoardAdapter>, testRegistry);
}

function card(id: string) {
  const element = document.querySelector(`[data-test="board-card-${id}"]`);

  return page.elementLocator(element as HTMLElement);
}

function columnList(key: string) {
  const element = document.querySelector(`[data-test="board-column-${key}"] ul`);

  return page.elementLocator(element as HTMLElement);
}

function cardOrder(columnKey: string): string[] {
  return Array.from(
    document.querySelectorAll(`[data-test="board-column-${columnKey}"] [data-test^="board-card-"]`),
    (element) => (element.getAttribute("data-test") ?? "").replace("board-card-", ""),
  );
}

async function dragOnto(sourceId: string, targetId: string, verticalRatio: number): Promise<void> {
  const target = card(targetId);
  const rect = target.element().getBoundingClientRect();

  await userEvent.dragAndDrop(card(sourceId), target, {
    targetPosition: { x: Math.round(rect.width / 2), y: Math.round(rect.height * verticalRatio) },
  });
}

const columns = [
  boardColumn("todo", "To Do"),
  boardColumn("doing", "In Progress"),
  boardColumn("done", "Done"),
];

function seededResult() {
  return boardResult([
    boardColumnCards("todo", [boardCard(1, "Write spec"), boardCard(2, "Review PR")], { total: 2 }),
    boardColumnCards("doing", [boardCard(3, "Build feature")], { total: 1 }),
    boardColumnCards("done", [], { total: 0 }),
  ]);
}

describe("board drag and drop in a browser", () => {
  it("reorders cards within a column optimistically and posts the move contract", async () => {
    const fetchMock = stubMoveFetch();
    await renderBoard({ columns, result: seededResult() });

    await dragOnto("1", "2", 0.9);

    await expect.poll(() => cardOrder("todo")).toEqual(["2", "1"]);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ cardId: "1", columnKey: "todo", position: 1 });
    await expect.poll(() => document.body.textContent, { timeout: 3000 }).toContain("Card moved");
  });

  it("moves a card across columns and posts its new column and position", async () => {
    const fetchMock = stubMoveFetch();
    await renderBoard({ columns, result: seededResult() });

    await dragOnto("1", "3", 0.1);

    await expect.poll(() => cardOrder("todo")).toEqual(["2"]);
    await expect.poll(() => cardOrder("doing")).toEqual(["1", "3"]);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ cardId: "1", columnKey: "doing", position: 0 });
  });

  it("drops a card into an empty column", async () => {
    const fetchMock = stubMoveFetch();
    await renderBoard({ columns, result: seededResult() });

    await userEvent.dragAndDrop(card("2"), columnList("done"));

    await expect.poll(() => cardOrder("done")).toEqual(["2"]);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ cardId: "2", columnKey: "done", position: 0 });
  });

  it("rolls a card back and announces the failure when the move action is rejected", async () => {
    stubMoveFetch(422);
    await renderBoard({ columns, result: seededResult() });

    await dragOnto("1", "2", 0.9);

    await expect
      .poll(() => document.body.textContent, { timeout: 3000 })
      .toContain("Could not move card");
    await expect.poll(() => cardOrder("todo")).toEqual(["1", "2"]);
  });

  it("does not drag a card when the board has no move action", async () => {
    const fetchMock = stubMoveFetch();
    await renderBoard({ columns, moveAction: null, result: seededResult() });

    await dragOnto("1", "2", 0.9);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(cardOrder("todo")).toEqual(["1", "2"]);
  });
});
