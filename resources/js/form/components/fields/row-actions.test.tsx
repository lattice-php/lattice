import { expect, it, vi, beforeAll, afterAll } from "vitest";
import { configure, getConfig, fireEvent, render, screen } from "@testing-library/react";

let prevTestIdAttribute: string;
beforeAll(() => {
  prevTestIdAttribute = getConfig().testIdAttribute;
  configure({ testIdAttribute: "data-test" });
});
afterAll(() => {
  configure({ testIdAttribute: prevTestIdAttribute });
});

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
