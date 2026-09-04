import { type Locator, page, userEvent } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { fakeNode, jsonResponse } from "@lattice-php/core/test-support";
import {
  inlineInputNodes,
  moveAction,
  stubMoveFetch,
  testRegistry,
  treeNode,
} from "./test-support";
import type { TreeNodeData } from "./types";
import TreeComponent from "./tree";

function renderTree(nodes: TreeNodeData[], extra: Record<string, unknown> = {}) {
  const node = fakeNode({
    id: "move-tree",
    props: { defaultExpanded: [], moveAction, nodes, rememberState: false, ...extra },
    type: "tree",
  });

  return renderWithRegistry(<TreeComponent node={node}>{null}</TreeComponent>, testRegistry);
}

function row(id: string) {
  const item = document.querySelector(`[data-test="tree-node-${id}"]`);

  return page.elementLocator(item?.firstElementChild as HTMLElement);
}

function treeLabels(): (string | null)[] {
  return Array.from(document.querySelectorAll('[role="treeitem"]'), (item) =>
    item.getAttribute("aria-label"),
  );
}

async function dropOn(sourceId: string, target: Locator, verticalRatio: number): Promise<void> {
  const rect = target.element().getBoundingClientRect();

  await userEvent.dragAndDrop(row(sourceId), target, {
    targetPosition: { x: Math.round(rect.width / 2), y: Math.round(rect.height * verticalRatio) },
  });
}

async function dragOnto(sourceId: string, targetId: string, verticalRatio: number): Promise<void> {
  await dropOn(sourceId, row(targetId), verticalRatio);
}

// A disabled row's body is `pointer-events-none`, so a real pointer drops on
// the treeitem around it rather than on the body.
async function dragOntoDisabled(sourceId: string, targetId: string): Promise<void> {
  await dropOn(sourceId, page.getByTestId(`tree-node-${targetId}`), 0.5);
}

describe("tree drag and drop in a browser", () => {
  it("reorders siblings optimistically and posts the move contract", async () => {
    const fetchMock = stubMoveFetch();
    await renderTree([treeNode("a", "Alpha"), treeNode("b", "Beta")]);

    await dragOnto("a", "b", 0.9);

    await expect.poll(treeLabels).toEqual(["Beta", "Alpha"]);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ nodeId: "a", parentId: null, position: 1 });
    await expect.poll(() => document.body.textContent, { timeout: 3000 }).toContain("Moved Alpha");
  });

  it("announces the dragged node when the move is rejected", async () => {
    stubMoveFetch(422);
    await renderTree([treeNode("a", "Alpha"), treeNode("b", "Beta")]);

    await dragOnto("a", "b", 0.9);

    await expect
      .poll(() => document.body.textContent, { timeout: 3000 })
      .toContain("Could not move Alpha");
    expect(treeLabels()).toEqual(["Alpha", "Beta"]);
  });

  it("moves a node into another parent", async () => {
    const fetchMock = stubMoveFetch();
    const screen = await renderTree([treeNode("a", "Alpha"), treeNode("b", "Beta")]);

    await dragOnto("a", "b", 0.5);

    await expect.element(screen.getByTestId("tree-node-a")).toHaveAttribute("aria-level", "2");
    await expect
      .element(screen.getByTestId("tree-node-b"))
      .toHaveAttribute("aria-expanded", "true");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ nodeId: "a", parentId: "b", position: 0 });
  });

  it("rejects drops on descendants and disabled targets", async () => {
    const fetchMock = stubMoveFetch();
    await renderTree(
      [
        treeNode("a", "Alpha", { children: [treeNode("b", "Beta")] }),
        treeNode("disabled", "Disabled", { disabled: true }),
      ],
      { defaultExpanded: ["a"] },
    );

    await dragOnto("a", "b", 0.5);
    await dragOntoDisabled("a", "disabled");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(treeLabels()).toEqual(["Alpha", "Beta", "Disabled"]);
  });

  it("blocks make-child on a node that rejects children but still reorders next to it", async () => {
    const fetchMock = stubMoveFetch();
    await renderTree([treeNode("a", "Alpha"), treeNode("b", "Beta", { acceptsChildren: false })]);

    await dragOnto("a", "b", 0.5);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(treeLabels()).toEqual(["Alpha", "Beta"]);

    await dragOnto("a", "b", 0.9);

    await expect.poll(treeLabels).toEqual(["Beta", "Alpha"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("blocks a drop whose subtree would exceed maxDepth", async () => {
    const fetchMock = stubMoveFetch();
    await renderTree(
      [treeNode("a", "Alpha", { children: [treeNode("c", "Gamma")] }), treeNode("b", "Beta")],
      { defaultExpanded: ["a"], maxDepth: 2 },
    );

    await dragOnto("a", "b", 0.5);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(treeLabels()).toEqual(["Alpha", "Gamma", "Beta"]);
  });

  it("does not drag the node when the gesture starts in an inline form control", async () => {
    const fetchMock = stubMoveFetch();
    const screen = await renderTree(inlineInputNodes);

    await userEvent.dragAndDrop(screen.getByRole("textbox"), row("9"));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(treeLabels()).toEqual(["Editable", "Suppliers"]);
  });

  it("loads an unloaded lazy target before dropping into it", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ nodes: [treeNode("child", "Child")] }))
      .mockResolvedValue(jsonResponse({ effects: [] }));
    vi.stubGlobal("fetch", fetchMock);
    const screen = await renderTree(
      [treeNode("a", "Alpha"), treeNode("parent", "Parent", { hasChildren: true })],
      { endpoint: "/lattice/trees/categories", lazy: true, ref: "tree-ref" },
    );

    await dragOnto("a", "parent", 0.5);

    await expect.element(screen.getByText("Child")).toBeVisible();
    await expect.element(screen.getByTestId("tree-node-a")).toHaveAttribute("aria-level", "2");
  });
});
