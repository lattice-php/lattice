import { userEvent } from "vitest/browser";
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
  testRegistry,
} from "./test-support";

function renderBoard(props: Record<string, unknown>) {
  const node = fakeNode({
    id: "kb-board",
    props: { columns: [], endpoint: null, perColumn: 25, ref: null, result: null, ...props },
    schema: cardTemplate,
    type: "board",
  });

  return renderWithRegistry(<BoardAdapter node={node}>{null}</BoardAdapter>, testRegistry);
}

describe("Board keyboard roving focus in a browser", () => {
  it("moves focus down and up within a column, updating the roving tabindex", async () => {
    const screen = await renderBoard({
      columns: [boardColumn("todo", "To Do")],
      result: boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec"), boardCard(2, "Review PR")], {
          total: 2,
        }),
      ]),
    });
    const first = screen.getByTestId("board-card-1");
    const second = screen.getByTestId("board-card-2");

    await expect.element(first).toHaveAttribute("tabindex", "0");
    await expect.element(second).toHaveAttribute("tabindex", "-1");

    await first.click();
    await userEvent.keyboard("{ArrowDown}");

    await expect.poll(() => document.activeElement).toBe(second.element());
    await expect.element(second).toHaveAttribute("tabindex", "0");
    await expect.element(first).toHaveAttribute("tabindex", "-1");

    await userEvent.keyboard("{ArrowUp}");

    await expect.poll(() => document.activeElement).toBe(first.element());
  });

  it("moves focus across columns with left/right, skipping an empty column", async () => {
    const screen = await renderBoard({
      columns: [
        boardColumn("todo", "To Do"),
        boardColumn("doing", "In Progress"),
        boardColumn("done", "Done"),
      ],
      result: boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec")], { total: 1 }),
        boardColumnCards("doing", [], { total: 0 }),
        boardColumnCards("done", [boardCard(3, "Ship release")], { total: 1 }),
      ]),
    });
    const todoCard = screen.getByTestId("board-card-1");
    const doneCard = screen.getByTestId("board-card-3");

    await todoCard.click();
    await userEvent.keyboard("{ArrowRight}");

    await expect.poll(() => document.activeElement).toBe(doneCard.element());

    await userEvent.keyboard("{ArrowLeft}");

    await expect.poll(() => document.activeElement).toBe(todoCard.element());
  });

  it("does not move focus past the last card in a column", async () => {
    const screen = await renderBoard({
      columns: [boardColumn("todo", "To Do")],
      result: boardResult([boardColumnCards("todo", [boardCard(1, "Write spec")], { total: 1 })]),
    });
    const only = screen.getByTestId("board-card-1");

    await only.click();
    await userEvent.keyboard("{ArrowDown}");

    await expect.poll(() => document.activeElement).toBe(only.element());
  });
});
