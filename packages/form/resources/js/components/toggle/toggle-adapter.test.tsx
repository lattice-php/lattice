import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { createFieldRenderer } from "../../test-support";
import { ToggleAdapter } from "./toggle-adapter";

const renderField = createFieldRenderer(ToggleAdapter);

describe("ToggleAdapter", () => {
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

  it("does not toggle while read-only but stays focusable", () => {
    renderField(
      fakeNode({
        type: "field.toggle",
        props: { label: "Locked", name: "locked", readOnly: true, value: true },
      }),
    );

    const toggle = screen.getByRole("switch", { name: "Locked" });

    fireEvent.click(toggle);

    expect(toggle).not.toBeDisabled();
    expect(toggle).toHaveAttribute("aria-readonly", "true");
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("does not toggle while disabled", () => {
    renderField(
      fakeNode({
        type: "field.toggle",
        props: { label: "Locked", name: "locked", disabled: true, value: false },
      }),
    );

    const toggle = screen.getByRole("switch", { name: "Locked" });

    fireEvent.click(toggle);

    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("uses the field name as its accessible label when no label is set", () => {
    renderField(fakeNode({ type: "field.toggle", props: { name: "notifications" } }));

    expect(screen.getByRole("switch", { name: "notifications" })).toBeVisible();
  });
});
