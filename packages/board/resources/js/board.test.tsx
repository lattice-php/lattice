import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@lattice-php/core/test-support";
import { boardCard, boardColumn, boardColumnCards, boardResult, renderBoard } from "./test-support";

describe("Board", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("load more", () => {
    beforeEach(() => {
      vi.stubGlobal(
        "fetch",
        vi.fn<typeof fetch>().mockResolvedValue(
          jsonResponse(
            boardResult([
              boardColumnCards("todo", [boardCard(2, "Review PR")], {
                hasMore: false,
                offset: 1,
                total: 2,
              }),
            ]),
          ),
        ),
      );
    });

    it("requests the column at the current offset, then appends the returned cards", async () => {
      renderBoard({
        columns: [boardColumn("todo", "To Do")],
        endpoint: "/lattice/boards/tasks",
        ref: "board-ref",
        result: boardResult([
          boardColumnCards("todo", [boardCard(1, "Write spec")], {
            hasMore: true,
            offset: 0,
            total: 2,
          }),
        ]),
      });

      fireEvent.click(screen.getByRole("button", { name: "Load more" }));

      await waitFor(() => expect(screen.getByText("Review PR")).toBeInTheDocument());
      expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();

      const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
        string,
        RequestInit,
      ];
      const requested = new URL(url, "http://localhost");
      expect(requested.pathname).toBe("/lattice/boards/tasks");
      expect(requested.searchParams.get("column")).toBe("todo");
      expect(requested.searchParams.get("offset")).toBe("1");
      expect((init.headers as Record<string, string>)["X-Lattice-Ref"]).toBe("board-ref");
    });
  });

  it("refetches on a matching reloadComponent event and replaces the board's cards", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          jsonResponse(
            boardResult([boardColumnCards("todo", [boardCard(9, "Fresh card")], { total: 1 })]),
          ),
        ),
    );

    renderBoard(
      {
        columns: [boardColumn("todo", "To Do")],
        endpoint: "/lattice/boards/tasks",
        result: boardResult([boardColumnCards("todo", [boardCard(1, "Write spec")], { total: 1 })]),
      },
      "tasks-board",
    );

    expect(screen.getByText("Write spec")).toBeInTheDocument();

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("lattice:reload-component", { detail: { component: "tasks-board" } }),
      );
    });

    await waitFor(() => expect(screen.getByText("Fresh card")).toBeInTheDocument());
    expect(screen.queryByText("Write spec")).not.toBeInTheDocument();
  });

  it("ignores a reloadComponent event addressed to another component", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(boardResult([])));
    vi.stubGlobal("fetch", fetchMock);

    renderBoard(
      {
        columns: [boardColumn("todo", "To Do")],
        endpoint: "/lattice/boards/tasks",
        result: boardResult([boardColumnCards("todo", [boardCard(1, "Write spec")], { total: 1 })]),
      },
      "tasks-board",
    );

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("lattice:reload-component", { detail: { component: "another-board" } }),
      );
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText("Write spec")).toBeInTheDocument();
  });
});
