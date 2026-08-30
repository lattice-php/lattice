import { act, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dropTargetForElements } from "@lattice-php/lattice/dnd";
import { jsonResponse, stubFetch } from "@lattice-php/core/test-support";
import { moveAction, renderTree, treeNode } from "./test-support";

// Real drag gestures for this suite live in tree-move.browser.test.tsx. Only the
// hover-expand timer stays here: it needs a drag paused mid-flight over a target,
// which the atomic browser-mode drag gesture cannot do, so the dnd module is
// mocked and the registered onDragEnter callback is invoked directly.
vi.mock("@lattice-php/lattice/dnd", () => ({
  announce: vi.fn(),
  attachTreeItemInstruction: (data: Record<string, unknown>) => data,
  cancelDragStartFromInteractive: () => () => {},
  combine:
    (...cleanups: Array<() => void>) =>
    () =>
      cleanups.forEach((cleanup) => cleanup()),
  draggable: vi.fn(() => () => {}),
  dropTargetForElements: vi.fn(() => () => {}),
  extractTreeItemInstruction: (data: Record<string, unknown>) => data.instruction ?? null,
}));

function dropTarget(id: string) {
  const call = vi
    .mocked(dropTargetForElements)
    .mock.calls.find(
      ([options]) => options.element.parentElement?.getAttribute("data-test") === `tree-node-${id}`,
    );

  if (!call) {
    throw new Error(`Missing drop target for ${id}`);
  }

  return call[0];
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("tree drag and drop", () => {
  it("expands and loads a lazy target after hovering it", async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch(jsonResponse({ nodes: [treeNode("child", "Child")] }));
    renderTree({
      endpoint: "/lattice/trees/categories",
      lazy: true,
      moveAction,
      nodes: [treeNode("parent", "Parent", { hasChildren: true })],
      ref: "tree-ref",
    });

    dropTarget("parent").onDragEnter?.({
      self: { data: { instruction: { currentLevel: 0, indentPerLevel: 24, type: "make-child" } } },
    } as never);

    await act(async () => vi.advanceTimersByTimeAsync(500));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Child")).toBeInTheDocument();
  });
});
