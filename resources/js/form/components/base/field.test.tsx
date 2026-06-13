import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormFieldFrame } from "./field";
import { TableCellProvider } from "../row-layout-context";

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
  // input is accessibly labeled via the sr-only <label for="qty">
  expect(screen.getByLabelText("Qty")).toBeInTheDocument();
  // the error still renders
  expect(screen.getByText("bad")).toBeInTheDocument();
  // the label is visually hidden
  expect(screen.getByText("Qty")).toHaveClass("sr-only");
});
