import { configure, fireEvent, getConfig, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/lattice/core/registry";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import { fakeNode } from "@lattice-php/lattice/test-support";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import TreeComponent, { type TreeNodeData } from "./tree";

const TestAction: RendererComponent = ({ node }) => (
  <button type="button">{String(node.props?.label ?? "")}</button>
);

const registry = createRegistry({
  components: {
    "test.action": eagerComponent(TestAction),
    tree: eagerComponent(TreeComponent),
  },
  name: "test/tree",
});

let previousTestIdAttribute: string;

beforeAll(() => {
  previousTestIdAttribute = getConfig().testIdAttribute;
  configure({ testIdAttribute: "data-test" });
});

afterAll(() => {
  configure({ testIdAttribute: previousTestIdAttribute });
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
  {
    children: [
      { href: "/c/2", id: "2", label: "Laptops" },
      { id: "3", label: "Phones" },
    ],
    id: "1",
    label: "Electronics",
  },
  { hasChildren: true, id: "9", label: "Suppliers" },
];

describe("Tree component", () => {
  it("renders roots and toggles a subtree via the chevron", () => {
    renderTree({ defaultExpanded: [], nodes });

    expect(screen.getByText("Electronics")).toBeVisible();
    expect(screen.queryByText("Laptops")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("tree-node-1-toggle"));

    expect(screen.getByText("Laptops")).toBeVisible();
  });

  it("shows a chevron for a lazy boundary and none for a leaf", () => {
    renderTree({ defaultExpanded: ["1"], nodes });

    expect(screen.getByTestId("tree-node-9-toggle")).toBeInTheDocument();
    expect(screen.queryByTestId("tree-node-3-toggle")).not.toBeInTheDocument();
  });

  it("marks the active node aria-selected", () => {
    renderTree({ activeId: "3", defaultExpanded: ["1"], nodes });

    expect(screen.getByTestId("tree-node-3")).toHaveAttribute("aria-selected", "true");
  });

  it("renders an href label as a link", () => {
    renderTree({ defaultExpanded: ["1"], nodes });

    expect(screen.getByRole("link", { name: "Laptops" })).toHaveAttribute("href", "/c/2");
  });

  it("marks a disabled node aria-disabled and renders its label as plain text", () => {
    const disabledNodes: TreeNodeData[] = [
      { disabled: true, href: "/c/4", id: "4", label: "Tablets" },
    ];

    renderTree({ nodes: disabledNodes });

    expect(screen.getByTestId("tree-node-4")).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByRole("link", { name: "Tablets" })).not.toBeInTheDocument();
  });

  it("renders trailing actions for a node", () => {
    const actionNodes = [
      {
        actions: { props: { label: "Delete" }, type: "test.action" },
        id: "5",
        label: "Accessories",
      },
    ] as unknown as TreeNodeData[];

    renderTree({ nodes: actionNodes });

    expect(screen.getByRole("button", { name: "Delete" })).toBeVisible();
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
