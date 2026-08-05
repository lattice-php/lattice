import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { announce, draggable, dropTargetForElements } from "@lattice-php/lattice/dnd";
import { fakeNode, renderWithRegistry, testRegistry, treeNode } from "./test-support";
import TreeComponent, { type TreeNodeData } from "./tree";

vi.mock("@lattice-php/lattice/dnd", () => ({
  announce: vi.fn(),
  attachTreeItemInstruction: (data: Record<string, unknown>) => data,
  combine:
    (...cleanups: Array<() => void>) =>
    () =>
      cleanups.forEach((cleanup) => cleanup()),
  draggable: vi.fn(() => () => {}),
  dropTargetForElements: vi.fn(() => () => {}),
  extractTreeItemInstruction: (data: Record<string, unknown>) => data.instruction ?? null,
}));

const moveAction = fakeNode({
  props: { endpoint: "/lattice/actions/move", method: "post", ref: "move-ref" },
  type: "action",
});

function renderTree(nodes: TreeNodeData[], extra: Record<string, unknown> = {}) {
  const node = fakeNode({
    id: "move-tree",
    props: { defaultExpanded: [], moveAction, nodes, rememberState: false, ...extra },
    type: "tree",
  });

  return renderWithRegistry(<TreeComponent node={node}>{null}</TreeComponent>, testRegistry);
}

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

function drop(sourceId: string, targetId: string, instruction: Record<string, unknown>): void {
  dropTarget(targetId).onDrop?.({
    self: { data: { instruction } },
    source: {
      data: {
        label: screen.getByTestId(`tree-node-${sourceId}`).getAttribute("aria-label"),
        nodeId: sourceId,
        type: "lattice-tree-node",
      },
    },
  } as never);
}

beforeEach(() => {
  vi.mocked(draggable).mockClear();
  vi.mocked(dropTargetForElements).mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("tree drag and drop", () => {
  it("reorders siblings optimistically and posts the move contract", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ effects: [] }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderTree([treeNode("a", "Alpha"), treeNode("b", "Beta")]);

    drop("a", "b", { currentLevel: 0, indentPerLevel: 24, type: "reorder-below" });

    await vi.waitFor(() => {
      expect(
        screen.getAllByRole("treeitem").map((item) => item.getAttribute("aria-label")),
      ).toEqual(["Beta", "Alpha"]);
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ nodeId: "a", parentId: null, position: 1 });
    await vi.waitFor(() => expect(announce).toHaveBeenCalledWith("Moved Alpha"));
  });

  it("announces the dragged node when the move is rejected", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ effects: [] }), {
          headers: { "Content-Type": "application/json" },
          status: 422,
        }),
      ),
    );
    renderTree([treeNode("a", "Alpha"), treeNode("b", "Beta")]);

    drop("a", "b", { currentLevel: 0, indentPerLevel: 24, type: "reorder-below" });

    await vi.waitFor(() => expect(announce).toHaveBeenCalledWith("Could not move Alpha"));
  });

  it("moves a node into another parent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ effects: [] }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
      ),
    );
    renderTree([treeNode("a", "Alpha"), treeNode("b", "Beta")]);

    drop("a", "b", { currentLevel: 0, indentPerLevel: 24, type: "make-child" });

    await vi.waitFor(() =>
      expect(screen.getByTestId("tree-node-a")).toHaveAttribute("aria-level", "2"),
    );
    expect(screen.getByTestId("tree-node-b")).toHaveAttribute("aria-expanded", "true");
  });

  it("blocks disabled targets and drops into descendants", () => {
    renderTree(
      [
        treeNode("a", "Alpha", { children: [treeNode("b", "Beta")] }),
        treeNode("disabled", "Disabled", { disabled: true }),
      ],
      { defaultExpanded: ["a"] },
    );

    const source = { data: { nodeId: "a", type: "lattice-tree-node" } };
    expect(dropTarget("b").canDrop?.({ source } as never)).toBe(false);
    expect(
      vi
        .mocked(dropTargetForElements)
        .mock.calls.some(
          ([options]) =>
            options.element.parentElement?.getAttribute("data-test") === "tree-node-disabled",
        ),
    ).toBe(false);
  });

  it("expands and loads a lazy target after hovering it", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ nodes: [treeNode("child", "Child")] }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderTree([treeNode("parent", "Parent", { hasChildren: true })], {
      endpoint: "/lattice/trees/categories",
      lazy: true,
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
