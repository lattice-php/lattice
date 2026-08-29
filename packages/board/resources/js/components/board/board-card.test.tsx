import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@lattice-php/core/test-support";
import { defaultNavigation, NavigationProvider } from "@lattice-php/ui/navigation";
import {
  boardCard,
  boardColumn,
  boardColumnCards,
  boardResult,
  cardAction,
  deleteAction,
  renderBoard,
} from "../../test-support";

describe("card click", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("visits the card's url when it carries one", () => {
    const visit = vi.fn();

    renderBoard(
      {
        cardAction: null,
        columns: [boardColumn("todo", "To Do")],
        result: boardResult([
          boardColumnCards("todo", [boardCard(1, "Write spec", { cardUrl: "/tasks/1" })]),
        ]),
      },
      "b1",
      {
        wrapper: ({ children }) => (
          <NavigationProvider adapter={{ ...defaultNavigation, visit }}>
            {children}
          </NavigationProvider>
        ),
      },
    );

    fireEvent.click(screen.getByTestId("board-card-1"));

    expect(visit).toHaveBeenCalledWith("/tasks/1");
  });

  it("runs the board's cardAction with the card and column when there is no cardUrl", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ effects: [] }, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    renderBoard({
      cardAction,
      columns: [boardColumn("todo", "To Do")],
      result: boardResult([boardColumnCards("todo", [boardCard(1, "Write spec")])]),
    });

    fireEvent.click(screen.getByTestId("board-card-1"));

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/lattice/actions/open-task");
    expect(JSON.parse(init.body as string)).toEqual({ cardId: "1", columnKey: "todo" });
  });

  it("activates the card on Enter when focused", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ effects: [] }, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    renderBoard({
      cardAction,
      columns: [boardColumn("todo", "To Do")],
      result: boardResult([boardColumnCards("todo", [boardCard(1, "Write spec")])]),
    });

    fireEvent.keyDown(screen.getByTestId("board-card-1"), { key: "Enter" });

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
  });

  it("does not activate the card when clicking its context menu trigger", () => {
    const visit = vi.fn();

    renderBoard(
      {
        cardAction: null,
        columns: [boardColumn("todo", "To Do")],
        result: boardResult([
          boardColumnCards("todo", [
            boardCard(1, "Write spec", { actions: [deleteAction(1)], cardUrl: "/tasks/1" }),
          ]),
        ]),
      },
      "b1",
      {
        wrapper: ({ children }) => (
          <NavigationProvider adapter={{ ...defaultNavigation, visit }}>
            {children}
          </NavigationProvider>
        ),
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "Card actions" }));

    expect(visit).not.toHaveBeenCalled();
  });

  it("does not navigate or run an action when there is neither a cardUrl nor a cardAction", () => {
    const visit = vi.fn();

    renderBoard(
      {
        cardAction: null,
        columns: [boardColumn("todo", "To Do")],
        result: boardResult([boardColumnCards("todo", [boardCard(1, "Write spec")])]),
      },
      "b1",
      {
        wrapper: ({ children }) => (
          <NavigationProvider adapter={{ ...defaultNavigation, visit }}>
            {children}
          </NavigationProvider>
        ),
      },
    );

    fireEvent.click(screen.getByTestId("board-card-1"));

    expect(visit).not.toHaveBeenCalled();
  });
});
