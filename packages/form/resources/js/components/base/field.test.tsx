import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { TableCellProvider } from "@lattice-php/form/hooks/row-layout-context";
import { FormFieldFrame } from "./field";

it("renders the bare frame inside a table cell", () => {
  const { rerender } = render(
    <FormFieldFrame id="qty" label="Qty" helperText="Whole numbers only">
      {(controlProps) => <input {...controlProps} />}
    </FormFieldFrame>,
  );

  expect(screen.getByText("Whole numbers only")).toBeInTheDocument();

  rerender(
    <TableCellProvider>
      <FormFieldFrame id="qty" label="Qty" helperText="Whole numbers only">
        {(controlProps) => <input {...controlProps} />}
      </FormFieldFrame>
    </TableCellProvider>,
  );

  expect(screen.getByLabelText("Qty")).toBeInTheDocument();
  expect(screen.queryByText("Whole numbers only")).not.toBeInTheDocument();
});
