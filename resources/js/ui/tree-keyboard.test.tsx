import { act, configure, fireEvent, getConfig, screen } from "@testing-library/react";
import { router } from "@inertiajs/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/lattice/core/registry";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import { fakeNode } from "@lattice-php/lattice/test-support";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import TreeComponent, { type TreeNodeData } from "./tree";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/lattice/test/inertia-mock")).inertiaMock(),
);

const actionClicks: string[] = [];
const TestAction: RendererComponent = ({ node }) => (
  <button onClick={() => actionClicks.push(String(node.props?.label ?? ""))} type="button">
    {String(node.props?.label ?? "")}
  </button>
);

const registry = createRegistry({
  components: {
    "test.action": eagerComponent(TestAction),
    tree: eagerComponent(TreeComponent),
  },
  name: "test/tree-keyboard",
});

let previousTestIdAttribute: string;

beforeAll(() => {
  previousTestIdAttribute = getConfig().testIdAttribute;
  configure({ testIdAttribute: "data-test" });
});

afterAll(() => {
  configure({ testIdAttribute: previousTestIdAttribute });
});

beforeEach(() => {
  vi.mocked(router.visit).mockClear();
  actionClicks.length = 0;
});

afterEach(() => {
  vi.useRealTimers();
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

function item(id: string): HTMLElement {
  return screen.getByTestId(`tree-node-${id}`);
}

const outOfOrderNodes: TreeNodeData[] = [
  {
    children: [
      { id: "20", label: "Second Child" },
      { id: "10", label: "First Child" },
    ],
    id: "9",
    label: "First Root",
  },
  { id: "1", label: "Second Root" },
];

describe("Tree keyboard navigation", () => {
  it("focuses the first root by default with a single roving tabindex", () => {
    renderTree({ defaultExpanded: ["1"], nodes });

    expect(item("1")).toHaveAttribute("tabindex", "0");
    expect(item("2")).toHaveAttribute("tabindex", "-1");
    expect(item("3")).toHaveAttribute("tabindex", "-1");
    expect(item("9")).toHaveAttribute("tabindex", "-1");
  });

  it("moves focus down and up across visible nodes, skipping collapsed subtrees", () => {
    renderTree({ defaultExpanded: [], nodes });
    item("1").focus();

    fireEvent.keyDown(item("1"), { key: "ArrowDown" });
    expect(item("9")).toHaveFocus();
    expect(item("9")).toHaveAttribute("tabindex", "0");
    expect(item("1")).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(item("9"), { key: "ArrowUp" });
    expect(item("1")).toHaveFocus();
  });

  it("moves focus by authored position even when sibling ids are not in ascending order", () => {
    renderTree({ defaultExpanded: [], nodes: outOfOrderNodes });
    item("9").focus();

    fireEvent.keyDown(item("9"), { key: "ArrowDown" });
    expect(item("1")).toHaveFocus();
  });

  it("descends to the first authored child even when child ids are not in ascending order", () => {
    renderTree({ defaultExpanded: ["9"], nodes: outOfOrderNodes });
    item("9").focus();

    fireEvent.keyDown(item("9"), { key: "ArrowRight" });
    expect(item("20")).toHaveFocus();
  });

  it("does not double-move focus when a keydown bubbles from a nested treeitem", () => {
    renderTree({ defaultExpanded: ["1"], nodes });
    item("1").focus();

    fireEvent.keyDown(item("1"), { key: "ArrowDown" });
    expect(item("2")).toHaveFocus();

    fireEvent.keyDown(item("2"), { key: "ArrowDown" });
    expect(item("3")).toHaveFocus();
  });

  it("expands a collapsed parent with ArrowRight, then descends into the first child", () => {
    renderTree({ defaultExpanded: [], nodes });
    item("1").focus();

    fireEvent.keyDown(item("1"), { key: "ArrowRight" });
    expect(screen.getByText("Laptops")).toBeVisible();
    expect(item("1")).toHaveFocus();

    fireEvent.keyDown(item("1"), { key: "ArrowRight" });
    expect(item("2")).toHaveFocus();

    fireEvent.keyDown(item("2"), { key: "ArrowRight" });
    expect(item("2")).toHaveFocus();
  });

  it("collapses an expanded parent with ArrowLeft, then moves focus to the parent", () => {
    renderTree({ defaultExpanded: ["1"], nodes });
    item("1").focus();

    fireEvent.keyDown(item("1"), { key: "ArrowDown" });
    expect(item("2")).toHaveFocus();

    fireEvent.keyDown(item("2"), { key: "ArrowLeft" });
    expect(item("1")).toHaveFocus();

    fireEvent.keyDown(item("1"), { key: "ArrowLeft" });
    expect(screen.queryByText("Laptops")).not.toBeInTheDocument();
    expect(item("1")).toHaveFocus();

    fireEvent.keyDown(item("1"), { key: "ArrowLeft" });
    expect(item("1")).toHaveFocus();
  });

  it("jumps to the first and last visible node with Home and End", () => {
    renderTree({ defaultExpanded: ["1"], nodes });
    item("1").focus();

    fireEvent.keyDown(item("1"), { key: "End" });
    expect(item("9")).toHaveFocus();

    fireEvent.keyDown(item("9"), { key: "Home" });
    expect(item("1")).toHaveFocus();
  });

  it("type-ahead focuses the next visible node whose label starts with the typed text", () => {
    vi.useFakeTimers();
    renderTree({ defaultExpanded: ["1"], nodes });
    item("1").focus();

    fireEvent.keyDown(item("1"), { key: "p" });
    expect(item("3")).toHaveFocus();

    act(() => vi.advanceTimersByTime(2000));

    fireEvent.keyDown(item("3"), { key: "s" });
    expect(item("9")).toHaveFocus();
  });

  it("accumulates type-ahead characters within the idle window and resets after it elapses", () => {
    vi.useFakeTimers();
    renderTree({ defaultExpanded: ["1"], nodes });
    item("1").focus();

    fireEvent.keyDown(item("1"), { key: "l" });
    fireEvent.keyDown(item("2"), { key: "a" });
    expect(item("2")).toHaveFocus();

    act(() => vi.advanceTimersByTime(2000));

    fireEvent.keyDown(item("2"), { key: "s" });
    expect(item("9")).toHaveFocus();
  });

  it("sets aria-level, aria-setsize and aria-posinset", () => {
    renderTree({ defaultExpanded: ["1"], nodes });

    expect(item("1")).toHaveAttribute("aria-level", "1");
    expect(item("1")).toHaveAttribute("aria-setsize", "2");
    expect(item("1")).toHaveAttribute("aria-posinset", "1");

    expect(item("9")).toHaveAttribute("aria-level", "1");
    expect(item("9")).toHaveAttribute("aria-setsize", "2");
    expect(item("9")).toHaveAttribute("aria-posinset", "2");

    expect(item("2")).toHaveAttribute("aria-level", "2");
    expect(item("2")).toHaveAttribute("aria-setsize", "2");
    expect(item("2")).toHaveAttribute("aria-posinset", "1");

    expect(item("3")).toHaveAttribute("aria-level", "2");
    expect(item("3")).toHaveAttribute("aria-setsize", "2");
    expect(item("3")).toHaveAttribute("aria-posinset", "2");
  });

  it("puts aria-expanded on the treeitem instead of the chevron, and leaves leaves without it", () => {
    renderTree({ defaultExpanded: ["1"], nodes });

    expect(item("1")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("tree-node-1-toggle")).not.toHaveAttribute("aria-expanded");
    expect(item("3")).not.toHaveAttribute("aria-expanded");

    fireEvent.click(screen.getByTestId("tree-node-1-toggle"));
    expect(item("1")).toHaveAttribute("aria-expanded", "false");
  });

  it("gives the chevron toggle an accessible name that reflects its state", () => {
    renderTree({ defaultExpanded: [], nodes });

    expect(screen.getByTestId("tree-node-1-toggle")).toHaveAttribute(
      "aria-label",
      "Expand Electronics",
    );

    fireEvent.click(screen.getByTestId("tree-node-1-toggle"));

    expect(screen.getByTestId("tree-node-1-toggle")).toHaveAttribute(
      "aria-label",
      "Collapse Electronics",
    );
  });

  it("activates the focused node on Enter by following its href", () => {
    renderTree({ defaultExpanded: ["1"], nodes });
    item("1").focus();

    fireEvent.keyDown(item("1"), { key: "ArrowDown" });
    expect(item("2")).toHaveFocus();

    fireEvent.keyDown(item("2"), { key: "Enter" });
    expect(router.visit).toHaveBeenCalledWith("/c/2");
  });

  it("activates the focused node on Space by marking it active when it has no href", () => {
    renderTree({ defaultExpanded: ["1"], nodes });
    item("1").focus();

    fireEvent.keyDown(item("1"), { key: "ArrowDown" });
    fireEvent.keyDown(item("2"), { key: "ArrowDown" });
    expect(item("3")).toHaveFocus();

    fireEvent.keyDown(item("3"), { key: " " });
    expect(item("3")).toHaveAttribute("aria-selected", "true");
    expect(router.visit).not.toHaveBeenCalled();
  });

  it("excludes a node's action control from the page tab order", () => {
    const actionNodes: TreeNodeData[] = [
      {
        actions: { props: { label: "Delete" }, type: "test.action" },
        id: "5",
        label: "Accessories",
      },
    ] as unknown as TreeNodeData[];

    renderTree({ nodes: actionNodes });

    expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute("tabindex", "-1");
  });

  it("triggers the focused node's action control on Enter when it has no href", () => {
    const actionNodes: TreeNodeData[] = [
      {
        actions: { props: { label: "Delete" }, type: "test.action" },
        id: "5",
        label: "Accessories",
      },
    ] as unknown as TreeNodeData[];

    renderTree({ nodes: actionNodes });
    item("5").focus();

    fireEvent.keyDown(item("5"), { key: "Enter" });

    expect(actionClicks).toEqual(["Delete"]);
    expect(router.visit).not.toHaveBeenCalled();
  });

  it("triggers the focused node's action control on Space when it has no href", () => {
    const actionNodes: TreeNodeData[] = [
      {
        actions: { props: { label: "Delete" }, type: "test.action" },
        id: "5",
        label: "Accessories",
      },
    ] as unknown as TreeNodeData[];

    renderTree({ nodes: actionNodes });
    item("5").focus();

    fireEvent.keyDown(item("5"), { key: " " });

    expect(actionClicks).toEqual(["Delete"]);
  });

  it("prefers href over an action when both are present", () => {
    const hrefAndActionNodes: TreeNodeData[] = [
      {
        actions: { props: { label: "Delete" }, type: "test.action" },
        href: "/c/5",
        id: "5",
        label: "Accessories",
      },
    ] as unknown as TreeNodeData[];

    renderTree({ nodes: hrefAndActionNodes });
    item("5").focus();

    fireEvent.keyDown(item("5"), { key: "Enter" });

    expect(router.visit).toHaveBeenCalledWith("/c/5");
    expect(actionClicks).toEqual([]);
  });
});
