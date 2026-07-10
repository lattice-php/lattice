import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormFieldFrame } from "./field";
import { TableCellProvider } from "@lattice-php/lattice/form/hooks/row-layout-context";

it("renders the label and error in normal (stack) context", () => {
  render(
    <FormFieldFrame label="Qty" name="qty" error="bad">
      <input aria-label="qty" />
    </FormFieldFrame>,
  );
  expect(screen.getByText("Qty")).toBeInTheDocument();
  expect(screen.getByText("bad")).toBeInTheDocument();
});

it("keeps a visually-hidden accessible label inside a table cell", () => {
  render(
    <TableCellProvider>
      <FormFieldFrame label="Qty" name="qty" error="bad">
        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
        <input id="qty" />
      </FormFieldFrame>
    </TableCellProvider>,
  );
  expect(screen.getByLabelText("Qty")).toBeInTheDocument();
  expect(screen.getByText("bad")).toBeInTheDocument();
  expect(screen.getByText("Qty")).toHaveClass("sr-only");
});

it("renders a tooltip trigger when a tooltip is provided", () => {
  render(
    <FormFieldFrame label="Qty" name="qty" tooltip="How many units">
      <input aria-label="qty" />
    </FormFieldFrame>,
  );
  expect(screen.getByRole("button", { name: "More information" })).toBeInTheDocument();
});

it("renders no tooltip trigger when no tooltip is provided", () => {
  render(
    <FormFieldFrame label="Qty" name="qty">
      <input aria-label="qty" />
    </FormFieldFrame>,
  );
  expect(screen.queryByRole("button", { name: "More information" })).not.toBeInTheDocument();
});
