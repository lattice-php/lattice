import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { createFieldRenderer } from "@lattice-php/form/test-support";
import { NumberInputComponent } from "./number-input";

const renderField = createFieldRenderer(NumberInputComponent);

describe("NumberInputComponent", () => {
  it("renders a number input and writes to the store", () => {
    renderField(fakeNode({ type: "field.number-input", props: { name: "qty", label: "Qty" } }));
    const input = screen.getByLabelText("Qty");

    expect(input).toHaveAttribute("type", "number");

    fireEvent.change(input, { target: { value: "5" } });
    expect(input).toHaveValue(5);
  });

  it("renders as a slider with a value readout", () => {
    renderField(
      fakeNode({
        type: "field.number-input",
        props: { name: "level", label: "Level", slider: true, min: 0, max: 10 },
      }),
      { level: "7" },
    );

    const slider = screen.getByRole("slider", { name: "Level" });
    expect(slider).toHaveValue("7");
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});

describe("NumberInputComponent affixes", () => {
  it("renders a text prefix around the input", () => {
    renderField(
      fakeNode({
        type: "field.number-input",
        props: { name: "price", label: "Price", prefix: { icon: null, text: "$" } },
      }),
    );

    expect(screen.getByText("$")).toBeVisible();
  });
});
