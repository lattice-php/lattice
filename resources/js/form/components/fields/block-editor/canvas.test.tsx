import { configure, fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";

beforeAll(() => configure({ testIdAttribute: "data-test" }));

vi.mock("@lattice-php/lattice/core/renderer", () => ({
  Renderer: ({ nodes }: { nodes: { props: { text: string } }[] }) => (
    <span>{nodes[0]?.props.text}</span>
  ),
}));

import { BlockCanvas } from "./canvas";

const templates = [
  { type: "hero", label: "Hero", schema: [] },
  { type: "text", label: "Text", schema: [] },
  { type: "columns", label: "Columns", schema: [], slots: [{ name: "main" }] },
  {
    type: "restricted",
    label: "Restricted",
    schema: [],
    slots: [{ name: "main", blocks: ["hero"] }],
  },
] as never[];

function renderCanvas(rows: Record<string, unknown>[], overrides: Record<string, unknown> = {}) {
  const handlers = {
    onSelect: vi.fn<(rowId: string) => void>(),
    onRemove: vi.fn<(path: unknown) => void>(),
    onAppend: vi.fn<(path: unknown, slot: string, type: string) => void>(),
  };

  render(
    <BlockCanvas
      rows={rows}
      templates={templates as never}
      addLabel="Add"
      wireFor={(id: string) =>
        (((overrides.wire as Record<string, unknown[]>) ?? {})[id] as never) ?? []
      }
      onPreviewSeed={() => {}}
      selectedId={(overrides.selectedId as string) ?? null}
      onSelect={handlers.onSelect}
      onMoveBlock={() => {}}
      onRemove={handlers.onRemove}
      onAppend={handlers.onAppend}
    />,
  );

  return handlers;
}

it("renders each row's wire and selects on click", () => {
  const wire = {
    a: [{ type: "heading", props: { text: "Alpha" } }],
    b: [{ type: "text", props: { text: "Beta" } }],
  };

  const { onSelect } = renderCanvas(
    [
      { rowId: "a", type: "hero" },
      { rowId: "b", type: "text" },
    ],
    { wire, selectedId: "a" },
  );

  expect(screen.getByText("Alpha")).toBeInTheDocument();
  expect(screen.getByTestId("block-shell-a")).toHaveAttribute("aria-selected", "true");

  fireEvent.click(screen.getByTestId("block-shell-b"));
  expect(onSelect).toHaveBeenCalledWith("b");
});

it("removes a block through its shell header", () => {
  const { onRemove } = renderCanvas([
    { rowId: "a", type: "hero" },
    { rowId: "b", type: "text" },
  ]);

  fireEvent.click(screen.getByTestId("block-remove-b"));

  expect(onRemove).toHaveBeenCalledWith([{ index: 1 }]);
});

it("renders slot areas with nested child shells for a slotted block", () => {
  const wire = { h1: [{ type: "heading", props: { text: "Inner" } }] };

  renderCanvas(
    [
      {
        rowId: "c1",
        type: "columns",
        slots: { main: [{ rowId: "h1", type: "hero" }] },
      },
    ],
    { wire },
  );

  expect(screen.getByTestId("block-slot-main")).toBeInTheDocument();
  expect(screen.getByTestId("block-shell-h1")).toBeInTheDocument();
  expect(screen.getByText("Inner")).toBeInTheDocument();
});

it("shows an empty-slot drop target when a slot has no children", () => {
  renderCanvas([{ rowId: "c1", type: "columns", slots: { main: [] } }]);

  expect(screen.getByText("Drop blocks here")).toBeInTheDocument();
});

it("selects a nested child without selecting its parent", () => {
  const { onSelect } = renderCanvas([
    {
      rowId: "c1",
      type: "columns",
      slots: { main: [{ rowId: "h1", type: "hero" }] },
    },
  ]);

  fireEvent.click(screen.getByTestId("block-shell-h1"));

  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith("h1");
});

it("offers only the allowed blocks in a restricted slot's add menu", () => {
  renderCanvas([{ rowId: "r1", type: "restricted", slots: { main: [] } }]);

  fireEvent.click(screen.getByTestId("builder-add"));

  expect(screen.getByTestId("builder-add-hero")).toBeInTheDocument();
  expect(screen.queryByTestId("builder-add-columns")).not.toBeInTheDocument();
  expect(screen.queryByTestId("builder-add-text")).not.toBeInTheDocument();
});

it("appends an allowed block into a slot through its add menu", () => {
  const { onAppend } = renderCanvas([{ rowId: "c1", type: "columns", slots: { main: [] } }]);

  fireEvent.click(screen.getByTestId("builder-add"));
  fireEvent.click(screen.getByTestId("builder-add-hero"));

  expect(onAppend).toHaveBeenCalledWith([{ index: 0 }], "main", "hero");
});

it("removes a nested child with its slot path", () => {
  const { onRemove } = renderCanvas([
    {
      rowId: "c1",
      type: "columns",
      slots: { main: [{ rowId: "h1", type: "hero" }] },
    },
  ]);

  fireEvent.click(screen.getByTestId("block-remove-h1"));

  expect(onRemove).toHaveBeenCalledWith([{ index: 0, slot: "main" }, { index: 0 }]);
});
