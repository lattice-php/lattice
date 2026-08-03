import { cleanup, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core";
import type { RendererComponent } from "@lattice-php/core";
import { fakeNode, renderWithRegistry, TestText, treeNode } from "./test-support";
import TreeComponent, { type TreeNodeData } from "./tree";

const TestAction: RendererComponent = ({ node }) => (
  <button type="button">{String(node.props?.label ?? "")}</button>
);

const registry = createRegistry({
  components: {
    "test.action": eagerComponent(TestAction),
    "test.text": eagerComponent(TestText),
    tree: eagerComponent(TreeComponent),
  },
  name: "test/tree",
});

function renderTree(props: Record<string, unknown>, id = "t1") {
  const node = fakeNode({
    id,
    props: { defaultExpanded: [], rememberState: false, ...props },
    type: "tree",
  });

  return renderWithRegistry(<TreeComponent node={node}>{null}</TreeComponent>, registry);
}

const nodes: TreeNodeData[] = [
  treeNode("1", "Electronics", {
    children: [treeNode("2", "Laptops", { href: "/c/2" }), treeNode("3", "Phones")],
  }),
  treeNode("9", "Suppliers", { hasChildren: true }),
];

describe("Tree component", () => {
  it("renders roots and toggles a subtree via the chevron", () => {
    renderTree({ defaultExpanded: [], nodes });

    expect(screen.getByText("Electronics")).toBeVisible();
    expect(screen.queryByText("Laptops")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("tree-node-1-toggle"));

    expect(screen.getByText("Laptops")).toBeVisible();
  });

  it("shows a chevron for a loadable boundary and none for a leaf or a dead boundary", () => {
    renderTree({ defaultExpanded: ["1"], endpoint: "/lattice/trees/demo", nodes, ref: "sealed" });

    expect(screen.getByTestId("tree-node-9-toggle")).toBeInTheDocument();
    expect(screen.queryByTestId("tree-node-3-toggle")).not.toBeInTheDocument();

    cleanup();
    renderTree({ defaultExpanded: ["1"], nodes });

    expect(screen.queryByTestId("tree-node-9-toggle")).not.toBeInTheDocument();
  });

  it("marks the active node aria-selected", () => {
    renderTree({ activeId: "3", defaultExpanded: ["1"], nodes });

    expect(screen.getByTestId("tree-node-3")).toHaveAttribute("aria-selected", "true");
  });

  it("marks a disabled node aria-disabled", () => {
    const disabledNodes: TreeNodeData[] = [
      treeNode("4", "Tablets", { disabled: true, href: "/c/4" }),
    ];

    renderTree({ nodes: disabledNodes });

    expect(screen.getByTestId("tree-node-4")).toHaveAttribute("aria-disabled", "true");
  });

  it("renders a node's schema body", () => {
    const actionNodes: TreeNodeData[] = [
      treeNode("5", "Accessories", {
        schema: [
          { props: { text: "Accessories" }, type: "test.text" },
          { props: { label: "Delete" }, type: "test.action" },
        ],
      }),
    ];

    renderTree({ nodes: actionNodes });

    expect(screen.getByText("Accessories")).toBeVisible();
    expect(screen.getByRole("button", { name: "Delete" })).toBeVisible();
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
