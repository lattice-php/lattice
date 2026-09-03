import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { createFieldRenderer } from "../../test-support";
import { CheckboxAdapter } from "./checkbox-adapter";

const renderField = createFieldRenderer(CheckboxAdapter);

describe("CheckboxAdapter", () => {
  it("toggles the value on click", () => {
    renderField(
      fakeNode({
        type: "field.checkbox",
        props: { label: "Accept terms", name: "terms", value: false },
      }),
    );

    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });

    expect(checkbox).toHaveAttribute("aria-checked", "false");

    fireEvent.click(checkbox);

    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("does not toggle while read-only but stays focusable", () => {
    renderField(
      fakeNode({
        type: "field.checkbox",
        props: { label: "Accept terms", name: "terms", readOnly: true, value: true },
      }),
    );

    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });

    fireEvent.click(checkbox);

    expect(checkbox).not.toBeDisabled();
    expect(checkbox).toHaveAttribute("aria-readonly", "true");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("does not toggle while disabled", () => {
    renderField(
      fakeNode({
        type: "field.checkbox",
        props: { disabled: true, label: "Accept terms", name: "terms", value: false },
      }),
    );

    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });

    fireEvent.click(checkbox);

    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });
});
