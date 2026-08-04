import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/lattice/core";
import { fakeNode, renderWithRegistry, TestText, treeNode } from "./test-support";
import TreeComponent, { type TreeNodeData } from "./tree";

const registry = createRegistry({
  components: { "test.text": eagerComponent(TestText), tree: eagerComponent(TreeComponent) },
  name: "test/tree-lazy",
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderLazyTree(props: Record<string, unknown>, id = "lazy-tree") {
  const node = fakeNode({
    id,
    props: {
      activeId: null,
      defaultExpanded: [],
      endpoint: "/lattice/trees/categories",
      lazy: true,
      ref: "sealed-ref",
      rememberState: false,
      ...props,
    },
    type: "tree",
  });

  return renderWithRegistry(<TreeComponent node={node}>{null}</TreeComponent>, registry);
}

const roots: TreeNodeData[] = [
  treeNode("electronics", "Electronics", { hasChildren: true }),
  treeNode("books", "Books"),
];

describe("lazy tree", () => {
  it("fetches children once when a node expands via its chevron", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ nodes: [treeNode("laptops", "Laptops")] }));
    renderLazyTree({ nodes: roots });

    fireEvent.click(screen.getByTestId("tree-node-electronics-toggle"));

    expect(await screen.findByText("Laptops")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/lattice/trees/categories?parent=electronics");
    expect(new Headers(init.headers).get("X-Lattice-Ref")).toBe("sealed-ref");
  });

  it("fetches children when ArrowRight expands a collapsed node", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ nodes: [treeNode("laptops", "Laptops")] }));
    renderLazyTree({ nodes: roots });

    fireEvent.keyDown(screen.getByTestId("tree-node-electronics"), { key: "ArrowRight" });

    expect(await screen.findByText("Laptops")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fetches on mount for nodes in defaultExpanded", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ nodes: [treeNode("laptops", "Laptops")] }));
    renderLazyTree({ defaultExpanded: ["electronics"], nodes: roots });

    expect(await screen.findByText("Laptops")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not refetch cached children on collapse and re-expand", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ nodes: [treeNode("laptops", "Laptops")] }));
    renderLazyTree({ nodes: roots });

    const toggle = screen.getByTestId("tree-node-electronics-toggle");
    fireEvent.click(toggle);
    expect(await screen.findByText("Laptops")).toBeInTheDocument();

    fireEvent.click(toggle);
    await waitFor(() => expect(screen.queryByText("Laptops")).not.toBeInTheDocument());

    fireEvent.click(toggle);
    expect(await screen.findByText("Laptops")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("collapses on a failed fetch and retries on the next expand", async () => {
    fetchMock
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValue(jsonResponse({ nodes: [treeNode("laptops", "Laptops")] }));
    renderLazyTree({ nodes: roots });

    const item = () => screen.getByTestId("tree-node-electronics");
    fireEvent.click(screen.getByTestId("tree-node-electronics-toggle"));

    await waitFor(() => expect(item()).toHaveAttribute("aria-expanded", "false"));

    fireEvent.click(screen.getByTestId("tree-node-electronics-toggle"));

    expect(await screen.findByText("Laptops")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fetches the roots for a lazy skeleton without wire nodes", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ nodes: roots }));
    renderLazyTree({ nodes: [] });

    expect(await screen.findByText("Electronics")).toBeInTheDocument();
    expect(await screen.findByText("Books")).toBeInTheDocument();

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe("/lattice/trees/categories?parent=");
    expect(screen.getByTestId("tree-node-electronics")).toHaveAttribute("tabindex", "0");
  });

  it("shows no chevron for hasChildren nodes without an endpoint", () => {
    renderLazyTree({ endpoint: null, lazy: false, nodes: roots, ref: null });

    expect(screen.queryByTestId("tree-node-electronics-toggle")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
