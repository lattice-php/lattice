import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@lattice-php/core/test-support";
import { useBoardState } from "./use-board-state";
import { boardCard, boardColumn, boardColumnCards, boardResult, moveAction } from "./test-support";
import type { BoardColumnView } from "./use-board-state";
import type { BoardMoveRequest } from "./board-store";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

type Props = Parameters<typeof useBoardState>[0];

function initialProps(overrides: Partial<Props> = {}): Props {
  return {
    columns: [boardColumn("todo", "To Do"), boardColumn("done", "Done")],
    componentRef: "board-ref",
    endpoint: "/lattice/boards/tasks",
    identity: "tasks-board",
    moveAction,
    perColumn: 25,
    result: boardResult([
      boardColumnCards("todo", [boardCard(1, "Write spec")], { total: 1 }),
      boardColumnCards("done", [], { total: 0 }),
    ]),
    ...overrides,
  };
}

function renderState(overrides: Partial<Props> = {}) {
  return renderHook((props: Props) => useBoardState(props), {
    initialProps: initialProps(overrides),
  });
}

function cardIds(columnsView: Map<string, BoardColumnView>, key: string): unknown[] {
  return columnsView.get(key)?.cards.map((card) => card.id) ?? [];
}

const request: BoardMoveRequest = { cardId: "1", columnKey: "done", position: 0 };

describe("useBoardState move", () => {
  it("applies the move optimistically before the request resolves", () => {
    fetchMock.mockImplementation(() => new Promise(() => {}));
    const { result } = renderState();

    act(() => {
      void result.current.move(request);
    });

    expect(cardIds(result.current.columnsView, "todo")).toEqual([]);
    expect(cardIds(result.current.columnsView, "done")).toEqual([1]);
    expect(result.current.moving).toBe(true);
  });

  it("keeps the optimistic state once the move action succeeds", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ effects: [] }, { status: 200 }));
    const { result } = renderState();

    await act(async () => {
      await result.current.move(request);
    });

    expect(cardIds(result.current.columnsView, "todo")).toEqual([]);
    expect(cardIds(result.current.columnsView, "done")).toEqual([1]);
    expect(result.current.moving).toBe(false);
  });

  it("rolls the card back when the move action is rejected", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ effects: [] }, { status: 422 }));
    const { result } = renderState();

    let accepted: boolean | undefined;

    await act(async () => {
      accepted = await result.current.move(request);
    });

    expect(accepted).toBe(false);
    expect(cardIds(result.current.columnsView, "todo")).toEqual([1]);
    expect(cardIds(result.current.columnsView, "done")).toEqual([]);
    expect(result.current.moving).toBe(false);
  });

  it("does not roll back a rejected move once a newer board reload already replaced it", async () => {
    let resolveFetch: (response: Response) => void = () => {};
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const { rerender, result } = renderState();

    let movePromise!: Promise<boolean>;
    act(() => {
      movePromise = result.current.move(request);
    });

    rerender(
      initialProps({
        result: boardResult([
          boardColumnCards("todo", [], { total: 0 }),
          boardColumnCards("done", [boardCard(1, "Write spec"), boardCard(2, "Fresh card")], {
            total: 2,
          }),
        ]),
      }),
    );

    resolveFetch(jsonResponse({ effects: [] }, { status: 422 }));

    await act(async () => {
      await movePromise;
    });
    await waitFor(() => expect(cardIds(result.current.columnsView, "done")).toContain(2));

    expect(cardIds(result.current.columnsView, "done")).toEqual([1, 2]);
  });

  it("keeps a load-more page appended and returns the card to its origin when the move is rejected", async () => {
    let resolveMove: (response: Response) => void = () => {};
    let resolveLoadMore: (response: Response) => void = () => {};

    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url.includes("/lattice/actions/move-task")) {
        return new Promise((resolve) => {
          resolveMove = resolve;
        });
      }

      return new Promise((resolve) => {
        resolveLoadMore = resolve;
      });
    });

    const { result } = renderState({
      result: boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec")], { hasMore: true, total: 3 }),
        boardColumnCards("done", [], { total: 0 }),
      ]),
    });

    let movePromise!: Promise<boolean>;
    act(() => {
      movePromise = result.current.move(request);
    });

    act(() => {
      result.current.loadMore("todo");
    });

    act(() => {
      resolveLoadMore(
        jsonResponse(
          boardResult([
            boardColumnCards("todo", [boardCard(3, "New card")], { hasMore: false, total: 3 }),
          ]),
        ),
      );
    });

    await waitFor(() => expect(cardIds(result.current.columnsView, "todo")).toEqual([3]));

    act(() => {
      resolveMove(jsonResponse({ effects: [] }, { status: 422 }));
    });

    await act(async () => {
      await movePromise;
    });

    expect(cardIds(result.current.columnsView, "todo")).toEqual([1, 3]);
    expect(cardIds(result.current.columnsView, "done")).toEqual([]);
  });

  it("does not leave a column's load-more stuck loading after a rejected move that overlapped it", async () => {
    let resolveMove: (response: Response) => void = () => {};
    let resolveLoadMore: (response: Response) => void = () => {};

    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url.includes("/lattice/actions/move-task")) {
        return new Promise((resolve) => {
          resolveMove = resolve;
        });
      }

      return new Promise((resolve) => {
        resolveLoadMore = resolve;
      });
    });

    const { result } = renderState({
      result: boardResult([
        boardColumnCards("todo", [boardCard(1, "Write spec")], { hasMore: true, total: 3 }),
        boardColumnCards("done", [], { total: 0 }),
      ]),
    });

    act(() => {
      result.current.loadMore("todo");
    });

    expect(result.current.columnsView.get("todo")?.loading).toBe(true);

    let movePromise!: Promise<boolean>;
    act(() => {
      movePromise = result.current.move(request);
    });

    act(() => {
      resolveLoadMore(
        jsonResponse(
          boardResult([
            boardColumnCards("todo", [boardCard(3, "New card")], { hasMore: false, total: 3 }),
          ]),
        ),
      );
    });

    await waitFor(() => expect(result.current.columnsView.get("todo")?.loading).toBe(false));

    act(() => {
      resolveMove(jsonResponse({ effects: [] }, { status: 422 }));
    });

    await act(async () => {
      await movePromise;
    });

    expect(result.current.columnsView.get("todo")?.loading).toBe(false);
  });

  it("does not send a request or flip moving for a no-op move", async () => {
    const { result } = renderState();

    let accepted: boolean | undefined;

    await act(async () => {
      accepted = await result.current.move({ cardId: "1", columnKey: "todo", position: 0 });
    });

    expect(accepted).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.moving).toBe(false);
  });

  it("cannot move when the board has no move action", async () => {
    const { result } = renderState({ moveAction: null });

    let accepted: boolean | undefined;

    await act(async () => {
      accepted = await result.current.move(request);
    });

    expect(accepted).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.canMove).toBe(false);
  });
});

describe("useBoardState resetColumn", () => {
  it("requests the column's first page and replaces its cards", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        boardResult([
          boardColumnCards("todo", [boardCard(1, "Write spec"), boardCard(3, "New card")], {
            hasMore: false,
            offset: 2,
            total: 2,
          }),
        ]),
      ),
    );

    const { result } = renderState();

    await act(async () => {
      result.current.resetColumn("todo");
      await waitFor(() => expect(cardIds(result.current.columnsView, "todo")).toContain(3));
    });

    expect(cardIds(result.current.columnsView, "todo")).toEqual([1, 3]);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const requested = new URL(url, "http://localhost");
    expect(requested.pathname).toBe("/lattice/boards/tasks");
    expect(requested.searchParams.get("column")).toBe("todo");
    expect(requested.searchParams.get("offset")).toBe("0");
    expect((init.headers as Record<string, string>)["X-Lattice-Ref"]).toBe("board-ref");
  });

  it("leaves other columns untouched", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(boardResult([boardColumnCards("todo", [boardCard(1, "Write spec")])])),
    );

    const { result } = renderState();

    await act(async () => {
      result.current.resetColumn("todo");
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    });

    expect(cardIds(result.current.columnsView, "done")).toEqual([]);
  });
});

describe("useBoardState search and filters", () => {
  it("reloads with the q param and updates search plus indicators from the response", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        boardResult(
          [boardColumnCards("todo", [boardCard(1, "Write spec")], { total: 1 })],
          [{ filter: "q", label: "Search", value: "Anna" }],
        ),
      ),
    );

    const { result } = renderState();

    await act(async () => {
      result.current.setSearch("Anna");
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    });

    expect(result.current.search).toBe("Anna");
    expect(result.current.indicators).toEqual([{ filter: "q", label: "Search", value: "Anna" }]);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(new URL(url, "http://localhost").searchParams.get("q")).toBe("Anna");
  });

  it("reloads with the tf param when a table filter is set", async () => {
    fetchMock.mockResolvedValue(jsonResponse(boardResult([boardColumnCards("todo", [])])));

    const { result } = renderState();

    await act(async () => {
      result.current.setTableFilter("assignee", { value: "Anna" });
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    });

    expect(result.current.tableFilters).toEqual({ assignee: { value: "Anna" } });

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(new URL(url, "http://localhost").searchParams.get("tf[assignee][value]")).toBe("Anna");
  });

  it("clears an inactive table filter value instead of sending it", async () => {
    fetchMock.mockResolvedValue(jsonResponse(boardResult([boardColumnCards("todo", [])])));

    const { result } = renderState();

    await act(async () => {
      result.current.setTableFilter("assignee", { value: "Anna" });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    });

    await act(async () => {
      result.current.setTableFilter("assignee", undefined);
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    });

    expect(result.current.tableFilters).toEqual({});

    const [url] = fetchMock.mock.calls[1] as [string];
    expect(new URL(url, "http://localhost").searchParams.has("tf[assignee][value]")).toBe(false);
  });

  it("resets both search and table filters", async () => {
    fetchMock.mockResolvedValue(jsonResponse(boardResult([boardColumnCards("todo", [])])));

    const { result } = renderState();

    await act(async () => {
      result.current.setSearch("Anna");
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    });

    await act(async () => {
      result.current.setTableFilter("assignee", { value: "Anna" });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    });

    await act(async () => {
      result.current.resetFilters();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    });

    expect(result.current.search).toBe("");
    expect(result.current.tableFilters).toEqual({});

    const [url] = fetchMock.mock.calls[2] as [string];
    const params = new URL(url, "http://localhost").searchParams;
    expect(params.has("q")).toBe(false);
    expect(params.has("tf[assignee][value]")).toBe(false);
  });

  it("carries the current q/tf into a load-more request", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        boardResult([
          boardColumnCards("todo", [boardCard(1, "Write spec")], { hasMore: true, total: 5 }),
        ]),
      ),
    );
    fetchMock.mockResolvedValueOnce(jsonResponse(boardResult([boardColumnCards("todo", [])])));

    const { result } = renderState();

    await act(async () => {
      result.current.setSearch("Anna");
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    });

    await act(async () => {
      result.current.loadMore("todo");
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    });

    const [url] = fetchMock.mock.calls[1] as [string];
    const params = new URL(url, "http://localhost").searchParams;
    expect(params.get("q")).toBe("Anna");
    expect(params.get("column")).toBe("todo");
  });

  it("carries the current q/tf into a quick-add column reset", async () => {
    fetchMock.mockResolvedValue(jsonResponse(boardResult([boardColumnCards("todo", [])])));

    const { result } = renderState();

    await act(async () => {
      result.current.setTableFilter("assignee", { value: "Anna" });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    });

    await act(async () => {
      result.current.resetColumn("todo");
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    });

    const [url] = fetchMock.mock.calls[1] as [string];
    const params = new URL(url, "http://localhost").searchParams;
    expect(params.get("tf[assignee][value]")).toBe("Anna");
    expect(params.get("column")).toBe("todo");
  });

  it("applies the latest of two overlapping search reloads even when the older response resolves first", async () => {
    let resolveFirst: (response: Response) => void = () => {};
    let resolveSecond: (response: Response) => void = () => {};

    fetchMock
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve;
          }),
      );

    const { result } = renderState();

    act(() => {
      result.current.setSearch("Anna");
    });

    act(() => {
      result.current.setSearch("Ben");
    });

    act(() => {
      resolveFirst(
        jsonResponse(
          boardResult([boardColumnCards("todo", [boardCard(1, "Anna's card")], { total: 1 })]),
        ),
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      resolveSecond(
        jsonResponse(
          boardResult([boardColumnCards("todo", [boardCard(2, "Ben's card")], { total: 1 })]),
        ),
      );
    });

    await waitFor(() => expect(cardIds(result.current.columnsView, "todo")).toEqual([2]));
    expect(result.current.search).toBe("Ben");
  });
});
