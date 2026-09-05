import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { createFieldRenderer } from "../../test-support";
import { CheckboxGroupAdapter } from "./checkbox-group-adapter";

const renderField = createFieldRenderer(CheckboxGroupAdapter);

function permissionsNode(props: Record<string, unknown> = {}) {
  return fakeNode({
    type: "field.checkbox-group",
    props: {
      label: "Permissions",
      name: "permissions",
      options: [
        { label: "View orders", value: "order:view", data: null, group: "Sales" },
        { label: "Manage orders", value: "order:manage", data: null, group: "Sales" },
        { label: "View invoices", value: "invoice:view", data: null, group: "Accounting" },
      ],
      value: [],
      ...props,
    },
  });
}

function submitted(): string[] {
  return [...document.querySelectorAll<HTMLInputElement>('input[name="permissions[]"]')].map(
    (input) => input.value,
  );
}

describe("CheckboxGroupAdapter", () => {
  it("submits the values the user checks and drops the ones they uncheck", () => {
    renderField(permissionsNode());

    fireEvent.click(screen.getByRole("checkbox", { name: "View orders" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "View invoices" }));

    expect(submitted()).toEqual(["order:view", "invoice:view"]);

    fireEvent.click(screen.getByRole("checkbox", { name: "View orders" }));

    expect(submitted()).toEqual(["invoice:view"]);
  });

  it("toggles a whole group and reports a partial group as mixed", () => {
    renderField(permissionsNode({ bulkToggleable: true }));

    const sales = screen.getByRole("checkbox", { name: "Sales" });

    fireEvent.click(sales);

    expect(submitted()).toEqual(["order:view", "order:manage"]);
    expect(sales).toHaveAttribute("aria-checked", "true");

    fireEvent.click(screen.getByRole("checkbox", { name: "Manage orders" }));

    expect(sales).toHaveAttribute("aria-checked", "mixed");

    fireEvent.click(sales);

    expect(submitted()).toEqual(["order:view", "order:manage"]);
  });

  it("selects every option across groups from the bulk toggle", () => {
    renderField(permissionsNode({ bulkToggleable: true }));

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all" }));

    expect(submitted()).toEqual(["order:view", "order:manage", "invoice:view"]);

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all" }));

    expect(submitted()).toEqual([]);
  });

  it("hides a collapsed section until its trigger is opened", () => {
    renderField(permissionsNode({ collapsed: true, collapsible: true }));

    expect(screen.queryByRole("checkbox", { name: "View orders" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Sales"));

    expect(screen.getByRole("checkbox", { name: "View orders" })).toBeVisible();
  });

  it("keeps a read-only group unchanged on click", () => {
    renderField(permissionsNode({ readOnly: true, value: ["order:view"] }));

    fireEvent.click(screen.getByRole("checkbox", { name: "Manage orders" }));

    expect(submitted()).toEqual(["order:view"]);
    expect(screen.getByRole("checkbox", { name: "Manage orders" })).not.toBeDisabled();
  });
});
