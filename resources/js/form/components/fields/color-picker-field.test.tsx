import { configure, fireEvent, getConfig, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormProvider } from "@lattice-php/lattice/form/hooks/context";
import { FormValuesProvider } from "@lattice-php/lattice/form/hooks/values";
import { ColorPickerFieldComponent } from "./color-picker-field";

let previousTestIdAttribute: string;

beforeAll(() => {
  previousTestIdAttribute = getConfig().testIdAttribute;
  configure({ testIdAttribute: "data-test" });
});

afterAll(() => {
  configure({ testIdAttribute: previousTestIdAttribute });
});

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

  return render(
    <FormProvider
      value={{
        action: "/forms/tags",
        clearErrors: () => {},
        componentRef: "ref-1",
        errors: {},
        fieldLabels: {},
        precognitive: false,
        processing: false,
        validate: () => {},
      }}
    >
      <FormValuesProvider initial={initial}>
        <ColorPickerFieldComponent node={node}>{null}</ColorPickerFieldComponent>
      </FormValuesProvider>
    </FormProvider>,
  );
}

describe("ColorPickerFieldComponent", () => {
  it("shows the placeholder when empty", () => {
    renderField({});

    expect(screen.getByTestId("color-picker-color")).toHaveTextContent("Pick a color");
  });

  it("shows the current hex on the trigger", () => {
    renderField({}, { color: "#ff5733" });

    expect(screen.getByTestId("color-picker-color")).toHaveTextContent("#ff5733");
  });

  it("commits a swatch pick into the hidden input", () => {
    const { container } = renderField({});

    fireEvent.click(screen.getByTestId("color-picker-color"));
    fireEvent.click(screen.getByRole("option", { name: "#3b82f6" }));

    expect(container.querySelector('input[type="hidden"][name="color"]')).toHaveValue("#3b82f6");
  });

  it("disables the trigger when the field is disabled", () => {
    renderField({ disabled: true });

    expect(screen.getByTestId("color-picker-color")).toBeDisabled();
  });
});
