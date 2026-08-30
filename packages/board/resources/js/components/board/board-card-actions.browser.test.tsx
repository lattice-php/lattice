import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { fakeNode, jsonResponse } from "@lattice-php/core/test-support";
import BoardAdapter from "./board-adapter";
import {
  archiveAction,
  boardCard,
  boardColumn,
  boardColumnCards,
  boardResult,
  cardTemplate,
  deleteAction,
  testRegistry,
} from "../../test-support";

function renderBoard(props: Record<string, unknown>) {
  const node = fakeNode({
    id: "actions-board",
    props: {
      cardAction: null,
      columns: [],
      createAction: null,
      endpoint: null,
      filters: [],
      moveAction: null,
      perColumn: 25,
      ref: null,
      result: null,
      searchable: false,
      ...props,
    },
    schema: cardTemplate,
    type: "board",
  });

  return renderWithRegistry(<BoardAdapter node={node}>{null}</BoardAdapter>, testRegistry);
}

describe("Board card actions in a browser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens the card's context menu and shows its actions", async () => {
    const screen = await renderBoard({
      columns: [boardColumn("todo", "To Do")],
      result: boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec", { actions: [deleteAction(1)] })]),
      ]),
    });

    const trigger = screen.getByRole("button", { name: "Card actions" });
    const deleteItem = screen.getByRole("button", { name: "Delete" });

    await expect.element(deleteItem).not.toBeInTheDocument();

    await trigger.click();

    await expect.element(deleteItem).toBeVisible();
  });

  it("runs the action without navigating the card, keeping the board's cardUrl inert", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ effects: [] }, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const screen = await renderBoard({
      columns: [boardColumn("todo", "To Do")],
      result: boardResult([
        boardColumnCards("todo", [
          boardCard(1, "Write spec", { actions: [deleteAction(1)], cardUrl: "/tasks/1" }),
        ]),
      ]),
    });

    await screen.getByRole("button", { name: "Card actions" }).click();
    await screen.getByRole("button", { name: "Delete" }).click();

    await expect.poll(() => fetchMock.mock.calls.length).toBeGreaterThan(0);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/lattice/actions/delete-task-1");
  });

  it("removes the card from the board immediately, before the delete response resolves", async () => {
    let resolveFetch: (response: Response) => void = () => {};
    const fetchMock = vi.fn<typeof fetch>(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const screen = await renderBoard({
      columns: [boardColumn("todo", "To Do")],
      result: boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec", { actions: [deleteAction(1)] })]),
      ]),
    });

    await screen.getByRole("button", { name: "Card actions" }).click();
    await screen.getByRole("button", { name: "Delete" }).click();

    await expect.element(screen.getByText("Write spec")).not.toBeInTheDocument();

    resolveFetch(jsonResponse({ effects: [] }, { status: 200 }));
    await expect.poll(() => fetchMock.mock.calls.length).toBeGreaterThan(0);
    await expect.element(screen.getByText("Write spec")).not.toBeInTheDocument();
  });

  it("restores the card when the delete action's response fails", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ effects: [] }, { status: 422 }));
    vi.stubGlobal("fetch", fetchMock);

    const screen = await renderBoard({
      columns: [boardColumn("todo", "To Do")],
      result: boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec", { actions: [deleteAction(1)] })]),
      ]),
    });

    await screen.getByRole("button", { name: "Card actions" }).click();
    await screen.getByRole("button", { name: "Delete" }).click();

    await expect.element(screen.getByText("Write spec")).toBeVisible();
  });

  it("leaves the board untouched when an action without removesRecord is clicked", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ effects: [] }, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const screen = await renderBoard({
      columns: [boardColumn("todo", "To Do")],
      result: boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec", { actions: [archiveAction(1)] })]),
      ]),
    });

    await screen.getByRole("button", { name: "Card actions" }).click();
    await screen.getByRole("button", { name: "Archive" }).click();

    await expect.poll(() => fetchMock.mock.calls.length).toBeGreaterThan(0);
    await expect.element(screen.getByText("Write spec")).toBeVisible();
  });
});
