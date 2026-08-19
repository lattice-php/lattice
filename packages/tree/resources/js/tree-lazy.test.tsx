import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakeNode, jsonResponse, renderWithRegistry } from "@lattice-php/core/test-support";
import { testRegistry, treeNode } from "./test-support";
import type { TreeNodeData } from "./types";
import TreeComponent from "./tree";

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

  return renderWithRegistry(<TreeComponent node={node}>{null}</TreeComponent>, testRegistry);
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

  it("invalidates loaded children when the revision changes", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ nodes: [treeNode("laptops", "Laptops")] }))
      .mockResolvedValueOnce(jsonResponse({ nodes: [treeNode("phones", "Phones")] }));
    const view = renderLazyTree({ defaultExpanded: ["electronics"], nodes: roots, revision: 1 });

    expect(await screen.findByText("Laptops")).toBeInTheDocument();

    view.rerender(
      <TreeComponent
        node={fakeNode({
          id: "lazy-tree",
          props: {
            activeId: null,
            defaultExpanded: ["electronics"],
            endpoint: "/lattice/trees/categories",
            lazy: true,
            nodes: roots,
            ref: "sealed-ref",
            rememberState: false,
            revision: 2,
          },
          type: "tree",
        })}
      >
        {null}
      </TreeComponent>,
    );

    expect(await screen.findByText("Phones")).toBeInTheDocument();
    expect(screen.queryByText("Laptops")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reveals and focuses an active node through its lazy ancestor path", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ nodes: [treeNode("laptops", "Laptops", { hasChildren: true })] }),
      )
      .mockResolvedValueOnce(jsonResponse({ nodes: [treeNode("target", "Target")] }));

    renderLazyTree({ activeId: "target", activePath: ["electronics", "laptops"], nodes: roots });

    expect(await screen.findByText("Target")).toBeInTheDocument();
    expect(screen.getByTestId("tree-node-electronics")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("tree-node-laptops")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("tree-node-target")).toHaveFocus();
    expect(screen.getByTestId("tree-node-target")).toHaveAttribute("aria-selected", "true");
    expect(fetchMock).toHaveBeenCalledTimes(2);
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

  it("refetches roots and drops cached children on a matching reload-component event", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ nodes: [treeNode("laptops", "Laptops")] }))
      .mockResolvedValueOnce(jsonResponse({ nodes: roots }))
      .mockResolvedValueOnce(jsonResponse({ nodes: [treeNode("phones", "Phones")] }));
    renderLazyTree({ defaultExpanded: ["electronics"], nodes: roots });

    expect(await screen.findByText("Laptops")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new CustomEvent("lattice:reload-component", { detail: { component: "lazy-tree" } }),
      );
    });

    expect(await screen.findByText("Phones")).toBeInTheDocument();
    expect(screen.queryByText("Laptops")).not.toBeInTheDocument();
    expect(screen.getByTestId("tree-node-electronics")).toHaveAttribute("aria-expanded", "true");
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const [reloadUrl] = fetchMock.mock.calls[1] as [string];
    expect(reloadUrl).toBe("/lattice/trees/categories?parent=");
  });

  it("ignores a reload-component event for another component", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ nodes: [treeNode("laptops", "Laptops")] }));
    renderLazyTree({ defaultExpanded: ["electronics"], nodes: roots });

    expect(await screen.findByText("Laptops")).toBeInTheDocument();

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("lattice:reload-component", { detail: { component: "another-tree" } }),
      );
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("ignores the reload-component event without an endpoint", async () => {
    const node = fakeNode({
      id: "inline-tree",
      props: {
        defaultExpanded: [],
        nodes: [treeNode("alpha", "Alpha")],
        rememberState: false,
      },
      type: "tree",
    });
    renderWithRegistry(<TreeComponent node={node}>{null}</TreeComponent>, testRegistry);

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("lattice:reload-component", { detail: { component: "inline-tree" } }),
      );
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
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
});
