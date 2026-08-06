import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeNode, renderTree, sampleNodes as nodes, treeNode } from "./test-support";
import TreeComponent, { type TreeNodeData } from "./tree";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Tree component", () => {
  it("renders roots and toggles a subtree via the chevron", () => {
    renderTree({ defaultExpanded: [], nodes });

    expect(screen.getByText("Electronics")).toBeVisible();
    expect(screen.queryByText("Laptops")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("tree-node-1-toggle"));

    expect(screen.getByText("Laptops")).toBeVisible();
  });

  it("shows a chevron for a loadable boundary but not for a leaf", () => {
    renderTree({ defaultExpanded: ["1"], endpoint: "/lattice/trees/demo", nodes, ref: "sealed" });

    expect(screen.getByTestId("tree-node-9-toggle")).toBeInTheDocument();
    expect(screen.queryByTestId("tree-node-3-toggle")).not.toBeInTheDocument();
  });

  it("hides the chevron for a dead boundary with no endpoint to load from", () => {
    renderTree({ defaultExpanded: ["1"], nodes });

    expect(screen.queryByTestId("tree-node-9-toggle")).not.toBeInTheDocument();
  });

  it("updates the active node when server props change", () => {
    const view = renderTree({ activeId: "1", defaultExpanded: ["1"], nodes });

    view.rerender(
      <TreeComponent
        node={fakeNode({
          id: "t1",
          props: { activeId: "3", defaultExpanded: ["1"], nodes, rememberState: false },
          type: "tree",
        })}
      >
        {null}
      </TreeComponent>,
    );

    expect(screen.getByTestId("tree-node-1")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("tree-node-3")).toHaveAttribute("aria-selected", "true");
  });

  it("selects a node from its row without selecting from the expander, link, or action", () => {
    const actionNodes: TreeNodeData[] = [
      treeNode("1", "Parent", {
        children: [
          treeNode("2", "Action node", {
            schema: [
              { props: { text: "Action node" }, type: "test.text" },
              { props: { label: "Delete" }, type: "test.action" },
            ],
          }),
          treeNode("3", "Link node", {
            schema: [{ props: { href: "/categories/3", label: "Open" }, type: "test.link" }],
          }),
        ],
      }),
    ];

    renderTree({ activeId: null, nodes: actionNodes });

    fireEvent.click(screen.getByTestId("tree-node-1-toggle"));
    expect(screen.getByTestId("tree-node-1")).toHaveAttribute("aria-selected", "false");

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByTestId("tree-node-2")).toHaveAttribute("aria-selected", "false");

    fireEvent.click(screen.getByRole("link", { name: "Open" }));
    expect(screen.getByTestId("tree-node-3")).toHaveAttribute("aria-selected", "false");

    fireEvent.click(screen.getByTestId("tree-node-2"));
    expect(screen.getByTestId("tree-node-2")).toHaveAttribute("aria-selected", "true");
  });

  it("posts the selection contract and rolls back a rejected selection", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ effects: [] }), {
        headers: { "Content-Type": "application/json" },
        status: 422,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderTree({
      activeId: "1",
      nodes,
      selectAction: {
        props: { endpoint: "/lattice/actions/select", method: "post", ref: "select-ref" },
        type: "action",
      },
    });

    fireEvent.click(screen.getByTestId("tree-node-9"));
    expect(screen.getByTestId("tree-node-9")).toHaveAttribute("aria-selected", "true");

    await waitFor(() =>
      expect(screen.getByTestId("tree-node-1")).toHaveAttribute("aria-selected", "true"),
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ nodeId: "9" });
    expect(new Headers(init.headers).get("X-Lattice-Ref")).toBe("select-ref");
  });

  it("keeps the label as the treeitem's accessible name even when the schema omits it", () => {
    const hiddenLabelNodes: TreeNodeData[] = [
      {
        id: "7",
        label: "Hidden Label",
        schema: [{ props: { text: "something else" }, type: "test.text" }],
      },
    ];

    renderTree({ nodes: hiddenLabelNodes });

    expect(screen.getByRole("treeitem", { name: "Hidden Label" })).toBeInTheDocument();
  });

  it("persists expanded ids when rememberState is set", () => {
    window.localStorage.clear();

    renderTree({ nodes, rememberState: true }, "remember-tree");

    fireEvent.click(screen.getByTestId("tree-node-1-toggle"));

    expect(window.localStorage.getItem("lattice:tree:remember-tree")).toBe('["1"]');
    window.localStorage.clear();
  });

  it("restores the persisted expanded ids", () => {
    window.localStorage.setItem("lattice:tree:remember-tree", JSON.stringify(["1"]));

    renderTree({ nodes, rememberState: true }, "remember-tree");

    expect(screen.getByText("Laptops")).toBeVisible();
    window.localStorage.clear();
  });
});
