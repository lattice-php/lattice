import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { createFieldRenderer } from "@lattice-php/form/test-support";
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

  it.each([
    { state: "read-only", props: { readOnly: true, value: true }, checked: "true" },
    { state: "disabled", props: { disabled: true, value: false }, checked: "false" },
  ])("does not toggle while $state", ({ props, checked }) => {
    renderField(
      fakeNode({
        type: "field.toggle",
        props: { label: "Locked", name: "locked", ...props },
      }),
    );

    const toggle = screen.getByRole("switch", { name: "Locked" });

    fireEvent.click(toggle);

    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute("aria-checked", checked);
  });

  it("uses the field name as its accessible label when no label is set", () => {
    renderField(fakeNode({ type: "field.toggle", props: { name: "notifications" } }));

    expect(screen.getByRole("switch", { name: "notifications" })).toBeVisible();
  });
});
