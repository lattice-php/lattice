import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@lattice-php/core/test-support";
import {
  archiveAction,
  boardCard,
  boardColumn,
  boardColumnCards,
  boardResult,
  deleteAction,
  renderBoard,
} from "../../test-support";

async function openCardMenu(): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: "Card actions" }));
  await screen.findByRole("button", { name: "Delete" });
}

describe("BoardCardActions optimistic removal", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("removes the card immediately when a removesRecord action is clicked, before the response resolves", async () => {
    let resolveFetch: (response: Response) => void = () => {};
    const fetchMock = vi.fn<typeof fetch>(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderBoard({
      columns: [boardColumn("todo", "To Do")],
      result: boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec", { actions: [deleteAction(1)] })]),
      ]),
    });

    await openCardMenu();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.queryByText("Write spec")).not.toBeInTheDocument();

    resolveFetch(jsonResponse({ effects: [] }, { status: 200 }));
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByText("Write spec")).not.toBeInTheDocument();
  });

  it("restores the card when the removesRecord action's response fails", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ effects: [] }, { status: 422 }));
    vi.stubGlobal("fetch", fetchMock);

    renderBoard({
      columns: [boardColumn("todo", "To Do")],
      result: boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec", { actions: [deleteAction(1)] })]),
      ]),
    });

    await openCardMenu();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.queryByText("Write spec")).not.toBeInTheDocument();

    await vi.waitFor(() => expect(screen.getByText("Write spec")).toBeInTheDocument());
  });

  it("does not touch the board when an action without removesRecord is clicked", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ effects: [] }, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    renderBoard({
      columns: [boardColumn("todo", "To Do")],
      result: boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec", { actions: [archiveAction(1)] })]),
      ]),
    });

    fireEvent.click(screen.getByRole("button", { name: "Card actions" }));
    fireEvent.click(await screen.findByRole("button", { name: "Archive" }));

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.getByText("Write spec")).toBeInTheDocument();
  });
});
