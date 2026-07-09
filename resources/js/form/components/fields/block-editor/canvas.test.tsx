import { configure, fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";

beforeAll(() => configure({ testIdAttribute: "data-test" }));

vi.mock("@lattice-php/lattice/core/renderer", () => ({
  Renderer: ({ nodes }: { nodes: { props: { text: string } }[] }) => (
    <span>{nodes[0]?.props.text}</span>
  ),
}));

import { BlockCanvas } from "./canvas";

it("renders each row's wire and selects on click", () => {
  const onSelect = vi.fn<(rowId: string) => void>();
  const rows = [
    { rowId: "a", type: "hero" },
    { rowId: "b", type: "text" },
  ];
  const wire = {
    a: [{ type: "heading", props: { text: "Alpha" } }],
    b: [{ type: "text", props: { text: "Beta" } }],
  } as never;

  render(
    <BlockCanvas
      rows={rows}
      wireFor={(id: string) => (wire as any)[id]}
      selectedId="a"
      onSelect={onSelect}
      onMoveBlock={() => {}}
    />,
  );

  expect(screen.getByText("Alpha")).toBeInTheDocument();
  expect(screen.getByTestId("block-shell-a")).toHaveAttribute("aria-selected", "true");

  fireEvent.click(screen.getByTestId("block-shell-b"));
  expect(onSelect).toHaveBeenCalledWith("b");
});
