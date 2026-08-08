import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { renderWithForm } from "@lattice-php/form/test-support";
import { ColorPickerFieldComponent } from "./color-picker-field";

function renderField(props: Record<string, unknown>, initial: Record<string, unknown> = {}) {
  const node = fakeNode({
    type: "field.color-picker",
    props: {
      name: "color",
      label: "Tag color",
      palette: ["#ef4444", "#3b82f6"],
      placeholder: "Pick a color",
      ...props,
    },
  });

  return renderWithForm(<ColorPickerFieldComponent node={node}>{null}</ColorPickerFieldComponent>, {
    initial,
    context: { action: "/forms/tags", componentRef: "ref-1" },
  });
}

describe("ColorPickerFieldComponent", () => {
  it("shows the placeholder when empty and commits a swatch pick", () => {
    const { container } = renderField({});

    expect(screen.getByTestId("color-picker-color")).toHaveTextContent("Pick a color");

    fireEvent.click(screen.getByTestId("color-picker-color"));
    fireEvent.click(screen.getByRole("option", { name: "#ef4444" }));

    expect(screen.getByTestId("color-picker-color")).toHaveTextContent("#ef4444");
    expect(container.querySelector('input[type="hidden"][name="color"]')).toHaveValue("#ef4444");
  });

  it("disables the trigger when the field is disabled", () => {
    renderField({ disabled: true });

    expect(screen.getByTestId("color-picker-color")).toBeDisabled();
  });
});
