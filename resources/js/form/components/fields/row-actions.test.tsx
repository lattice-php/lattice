import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { RowActions } from "./row-actions";

it("renders a single action inline (no menu)", () => {
  const onClick = vi.fn<() => void>();
  render(<RowActions actions={[{ key: "remove", label: "Remove", icon: "trash-2", onClick }]} />);
  fireEvent.click(screen.getByTestId("row-action-remove"));
  expect(onClick).toHaveBeenCalled();
  expect(screen.queryByTestId("row-actions-menu")).not.toBeInTheDocument();
});

it("collapses 2+ actions into a kebab menu", () => {
  const dup = vi.fn<() => void>();
  render(
    <RowActions
      actions={[
        { key: "remove", label: "Remove", icon: "trash-2", onClick: () => {} },
        { key: "duplicate", label: "Duplicate", icon: "copy", onClick: dup },
      ]}
    />,
  );
  fireEvent.click(screen.getByTestId("row-actions-menu"));
  fireEvent.click(screen.getByText("Duplicate"));
  expect(dup).toHaveBeenCalled();
});

it("renders nothing for an empty action list", () => {
  const { container } = render(<RowActions actions={[]} />);
  expect(container).toBeEmptyDOMElement();
});

it("applies destructive styling to a menu item", () => {
  render(
    <RowActions
      actions={[
        { key: "duplicate", label: "Duplicate", icon: "copy", onClick: () => {} },
        { key: "remove", label: "Remove", icon: "trash-2", onClick: () => {}, destructive: true },
      ]}
    />,
  );
  fireEvent.click(screen.getByTestId("row-actions-menu"));
  expect(screen.getByTestId("row-action-remove")).toHaveClass("text-lt-danger");
  expect(screen.getByTestId("row-action-duplicate")).not.toHaveClass("text-lt-danger");
});
