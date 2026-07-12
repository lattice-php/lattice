import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createFieldRenderer, fakeConditions, fakeNode } from "@lattice-php/lattice/test-support";
import { FieldScopeProvider } from "@lattice-php/lattice/form/hooks/field-scope";
import { FormValuesProvider } from "@lattice-php/lattice/form/hooks/values";
import { ToggleComponent } from "./toggle";

const renderField = createFieldRenderer(ToggleComponent);

describe("ToggleComponent", () => {
  it("renders helper text and toggles a boolean value", () => {
    renderField(
      fakeNode({
        type: "field.toggle",
        props: {
          helperText: "Show this item publicly.",
          label: "Published",
          name: "published",
          value: false,
        },
      }),
    );

    const toggle = screen.getByRole("switch", { name: "Published" });

    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("Show this item publicly.")).toBeVisible();
    expect(document.querySelector('input[type="hidden"][name="published"]')).toHaveValue("0");

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(document.querySelector('input[type="hidden"][name="published"]')).toHaveValue("1");
  });

  it("uses form state before the field default", () => {
    renderField(
      fakeNode({
        type: "field.toggle",
        props: { label: "Featured", name: "featured", value: false },
      }),
      { featured: true },
    );

    expect(screen.getByRole("switch", { name: "Featured" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("does not toggle while read-only", () => {
    renderField(
      fakeNode({
        type: "field.toggle",
        props: { label: "Locked", name: "locked", readOnly: true, value: true },
      }),
    );

    const toggle = screen.getByRole("switch", { name: "Locked" });

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(toggle).toBeDisabled();
  });

  it("hides when its visible condition fails", () => {
    renderField(
      fakeNode({
        type: "field.toggle",
        props: {
          label: "Published",
          name: "published",
          conditions: fakeConditions({
            visible: [{ field: "status", operator: "eq", value: "live" }],
          }),
        },
      }),
      { status: "draft" },
    );

    expect(screen.queryByRole("switch", { name: "Published" })).not.toBeInTheDocument();
  });

  it("uses scoped row values and names inside row fields", () => {
    const node = fakeNode({
      type: "field.toggle",
      props: { label: "Approved", name: "approved", value: false },
    });

    render(
      <FormValuesProvider initial={{ approved: false }}>
        <FieldScopeProvider base="items" index={0} row={{ approved: true }} onChange={() => {}}>
          <ToggleComponent node={node}>{null}</ToggleComponent>
        </FieldScopeProvider>
      </FormValuesProvider>,
    );

    const toggle = screen.getByRole("switch", { name: "Approved" });

    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(toggle).toHaveAttribute("name", "items[0][approved]");
    expect(document.querySelector('input[type="hidden"][name="items[0][approved]"]')).toHaveValue(
      "1",
    );
  });

  it("uses the field name as its accessible label when no label is set", () => {
    renderField(fakeNode({ type: "field.toggle", props: { name: "notifications" } }));

    expect(screen.getByRole("switch", { name: "notifications" })).toBeVisible();
  });

  it("does not toggle while disabled", () => {
    renderField(
      fakeNode({
        type: "field.toggle",
        props: { disabled: true, label: "Notifications", name: "notifications", value: false },
      }),
    );

    const toggle = screen.getByRole("switch", { name: "Notifications" });

    fireEvent.click(toggle);

    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("applies autofocus and tab index props", () => {
    renderField(
      fakeNode({
        type: "field.toggle",
        props: { autoFocus: true, label: "Notifications", name: "notifications", tabIndex: 2 },
      }),
    );

    const toggle = screen.getByRole("switch", { name: "Notifications" });

    expect(toggle).toHaveAttribute("tabindex", "2");
    expect(toggle).toHaveFocus();
  });
});
