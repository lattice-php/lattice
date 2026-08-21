import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { FormField } from "./form-field";

it("connects a standalone control to its label, helper text, and error", () => {
  render(
    <FormField
      id="qty"
      label="Qty"
      helperText="Whole numbers only"
      error="Invalid quantity"
      required
    >
      {(controlProps) => <input {...controlProps} />}
    </FormField>,
  );

  const input = screen.getByLabelText("Qty");

  expect(input).not.toHaveAttribute("required");
  expect(input).toHaveAttribute("aria-required", "true");
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAttribute("aria-describedby", "qty-helper qty-error");
  expect(screen.getByText("Whole numbers only")).toHaveAttribute("id", "qty-helper");
  expect(screen.getByText("Invalid quantity")).toHaveAttribute("id", "qty-error");
});

it("keeps a visually-hidden accessible label and drops the helper text when bare", () => {
  render(
    <FormField bare id="qty" label="Qty" helperText="Whole numbers only" error="bad">
      {(controlProps) => <input {...controlProps} />}
    </FormField>,
  );

  expect(screen.getByLabelText("Qty")).toBeInTheDocument();
  expect(screen.getByLabelText("Qty")).toHaveAttribute("aria-describedby", "qty-error");
  expect(screen.queryByText("Whole numbers only")).not.toBeInTheDocument();
  expect(screen.getByText("bad")).toHaveAttribute("id", "qty-error");
});

it("renders a tooltip trigger only when a tooltip is provided", () => {
  const { rerender } = render(
    <FormField id="qty" label="Qty" tooltip="How many units">
      {(controlProps) => <input {...controlProps} />}
    </FormField>,
  );

  expect(screen.getByRole("button", { name: "More information" })).toBeInTheDocument();

  rerender(
    <FormField id="qty" label="Qty">
      {(controlProps) => <input {...controlProps} />}
    </FormField>,
  );

  expect(screen.queryByRole("button", { name: "More information" })).not.toBeInTheDocument();
});
