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
