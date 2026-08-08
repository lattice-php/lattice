import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { RowActions } from "./row-actions";

it("renders a single action inline (no menu)", () => {
  const onClick = vi.fn<() => void>();
  render(<RowActions actions={[{ key: "remove", label: "Remove", icon: "trash-2", onClick }]} />);
  fireEvent.click(screen.getByTestId("row-action-remove"));
  expect(onClick).toHaveBeenCalled();
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
