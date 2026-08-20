import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { registry } from "@lattice-php/lattice/registry";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import type { ColumnPropsOf, TableColumn, TableRow } from "@lattice-php/table/types";
import { TextCell } from "./text-cell";

function column(): TableColumn {
  return {
    key: "customer_name",
    type: "column.text",
    props: {
      label: "Customer",
      width: "md",
      align: "start",
      sortable: false,
      toggleable: false,
      hiddenByDefault: false,
      filter: null,
    },
  } as TableColumn;
}

function row(): TableRow {
  return {
    id: 1,
    customer_name: "Ada Lovelace",
    popovers: {
      customer_name: { type: "text", props: { text: "Customer card for Ada" } },
    },
  };
}

describe("TextCell popover in a browser", () => {
  it("renders the value as a trigger and opens the rendered popover node on click", async () => {
    const screen = await renderWithRegistry(
      <TextCell
        column={column()}
        props={column().props as ColumnPropsOf<"column.text">}
        row={row()}
        value="Ada Lovelace"
      />,
      registry,
    );

    const trigger = screen.getByRole("button", { name: "Ada Lovelace" });
    await expect.element(trigger).toBeInTheDocument();
    await expect.element(screen.getByText("Customer card for Ada")).not.toBeInTheDocument();

    await userEvent.click(trigger);

    await expect.element(screen.getByText("Customer card for Ada")).toBeVisible();
  });
});
