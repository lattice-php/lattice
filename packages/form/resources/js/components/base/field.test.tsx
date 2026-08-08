import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { TableCellProvider } from "@lattice-php/form/hooks/row-layout-context";
import { FormFieldFrame } from "./field";

it("connects a standalone control to its label, helper text, and error", () => {
  render(
    <FormFieldFrame
      id="qty"
      label="Qty"
      helperText="Whole numbers only"
      error="Invalid quantity"
      required
    >
      {(controlProps) => <input {...controlProps} />}
    </FormFieldFrame>,
  );

  const input = screen.getByLabelText("Qty");

  expect(input).not.toHaveAttribute("required");
  expect(input).toHaveAttribute("aria-required", "true");
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAttribute("aria-describedby", "qty-helper qty-error");
  expect(screen.getByText("Whole numbers only")).toHaveAttribute("id", "qty-helper");
  expect(screen.getByText("Invalid quantity")).toHaveAttribute("id", "qty-error");
});

it("keeps a visually-hidden accessible label inside a table cell", () => {
  render(
    <TableCellProvider>
      <FormFieldFrame id="qty" label="Qty" error="bad">
        {(controlProps) => <input {...controlProps} />}
      </FormFieldFrame>
    </TableCellProvider>,
  );

  expect(screen.getByLabelText("Qty")).toBeInTheDocument();
  expect(screen.getByText("bad")).toHaveAttribute("id", "qty-error");
});

it("renders a tooltip trigger only when a tooltip is provided", () => {
  const { rerender } = render(
    <FormFieldFrame id="qty" label="Qty" tooltip="How many units">
      {(controlProps) => <input {...controlProps} />}
    </FormFieldFrame>,
  );

  expect(screen.getByRole("button", { name: "More information" })).toBeInTheDocument();

  rerender(
    <FormFieldFrame id="qty" label="Qty">
      {(controlProps) => <input {...controlProps} />}
    </FormFieldFrame>,
  );

  expect(screen.queryByRole("button", { name: "More information" })).not.toBeInTheDocument();
});
