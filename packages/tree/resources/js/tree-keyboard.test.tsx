import { act, fireEvent, screen } from "@testing-library/react";
import { router } from "@inertiajs/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  actionClicks,
  moveAction,
  renderTree,
  sampleNodes as nodes,
  stubMoveFetch,
  treeNode,
} from "./test-support";
import { type TreeNodeData } from "./tree";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
);

beforeEach(() => {
  vi.mocked(router.visit).mockClear();
  actionClicks.length = 0;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function item(id: string): HTMLElement {
  return screen.getByTestId(`tree-node-${id}`);
}

const outOfOrderNodes: TreeNodeData[] = [
  treeNode("9", "First Root", {
    children: [treeNode("20", "Second Child"), treeNode("10", "First Child")],
  }),
  treeNode("1", "Second Root"),
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
      treeNode("5", "Accessories", {
        schema: [
          { props: { text: "Accessories" }, type: "test.text" },
          { props: { label: "Delete" }, type: "test.action" },
        ],
      }),
    ];

    renderTree({ nodes: actionNodes });

    expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute("tabindex", "-1");
  });

  it("triggers the focused node's action control on Enter when it has no href", () => {
    const actionNodes: TreeNodeData[] = [
      treeNode("5", "Accessories", {
        schema: [
          { props: { text: "Accessories" }, type: "test.text" },
          { props: { label: "Delete" }, type: "test.action" },
        ],
      }),
    ];

    renderTree({ nodes: actionNodes });
    item("5").focus();

    fireEvent.keyDown(item("5"), { key: "Enter" });

    expect(actionClicks).toEqual(["Delete"]);
    expect(router.visit).not.toHaveBeenCalled();
  });

  it("triggers the focused node's action control on Space when it has no href", () => {
    const actionNodes: TreeNodeData[] = [
      treeNode("5", "Accessories", {
        schema: [
          { props: { text: "Accessories" }, type: "test.text" },
          { props: { label: "Delete" }, type: "test.action" },
        ],
      }),
    ];

    renderTree({ nodes: actionNodes });
    item("5").focus();

    fireEvent.keyDown(item("5"), { key: " " });

    expect(actionClicks).toEqual(["Delete"]);
  });

  it("prefers href over an action when both are present", () => {
    const hrefAndActionNodes: TreeNodeData[] = [
      treeNode("5", "Accessories", {
        href: "/c/5",
        schema: [
          { props: { text: "Accessories" }, type: "test.text" },
          { props: { label: "Delete" }, type: "test.action" },
        ],
      }),
    ];

    renderTree({ nodes: hrefAndActionNodes });
    item("5").focus();

    fireEvent.keyDown(item("5"), { key: "Enter" });

    expect(router.visit).toHaveBeenCalledWith("/c/5");
    expect(actionClicks).toEqual([]);
  });

  it("moves a node with Ctrl Shift Arrow and posts the zero-based move contract", async () => {
    const fetchMock = stubMoveFetch();
    const movable = [treeNode("a", "Alpha"), treeNode("b", "Beta"), treeNode("c", "Gamma")];

    renderTree({ moveAction, nodes: movable });

    expect(item("a")).toHaveAttribute(
      "aria-keyshortcuts",
      "Control+Shift+ArrowUp Control+Shift+ArrowDown Control+Shift+ArrowLeft Control+Shift+ArrowRight",
    );

    fireEvent.keyDown(item("a"), { ctrlKey: true, key: "ArrowDown", shiftKey: true });

    await vi.waitFor(() => {
      expect(
        screen.getAllByRole("treeitem").map((element) => element.getAttribute("aria-label")),
      ).toEqual(["Beta", "Alpha", "Gamma"]);
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ nodeId: "a", parentId: null, position: 1 });
  });

  it("indents and outdents with the keyboard alternative", async () => {
    const fetchMock = stubMoveFetch();

    renderTree({ moveAction, nodes: [treeNode("a", "Alpha"), treeNode("b", "Beta")] });

    fireEvent.keyDown(item("b"), { ctrlKey: true, key: "ArrowRight", shiftKey: true });

    await vi.waitFor(() => expect(item("b")).toHaveAttribute("aria-level", "2"));
    expect(item("a")).toHaveAttribute("aria-expanded", "true");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await vi.waitFor(() => {
      fireEvent.keyDown(item("b"), { ctrlKey: true, key: "ArrowLeft", shiftKey: true });
      expect(item("b")).toHaveAttribute("aria-level", "1");
    });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(String((fetchMock.mock.calls[0] as [string, RequestInit])[1].body))).toEqual({
      nodeId: "b",
      parentId: "a",
      position: 0,
    });
    expect(JSON.parse(String((fetchMock.mock.calls[1] as [string, RequestInit])[1].body))).toEqual({
      nodeId: "b",
      parentId: null,
      position: 1,
    });
  });

  it("rolls an optimistic keyboard move back when the server rejects it", async () => {
    const fetchMock = stubMoveFetch(422);

    renderTree({ moveAction, nodes: [treeNode("a", "Alpha"), treeNode("b", "Beta")] });

    fireEvent.keyDown(item("a"), { ctrlKey: true, key: "ArrowDown", shiftKey: true });

    await vi.waitFor(() => {
      expect(
        screen.getAllByRole("treeitem").map((element) => element.getAttribute("aria-label")),
      ).toEqual(["Alpha", "Beta"]);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
