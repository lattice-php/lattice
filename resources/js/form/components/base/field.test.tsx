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

it("omits the label but keeps the error inside a table cell", () => {
  render(
    <TableCellProvider>
      <FormFieldFrame label="Qty" name="qty" error="bad">
        <input aria-label="qty" />
      </FormFieldFrame>
    </TableCellProvider>,
  );
  expect(screen.queryByText("Qty")).not.toBeInTheDocument();
  expect(screen.getByText("bad")).toBeInTheDocument();
});
