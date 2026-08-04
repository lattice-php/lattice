import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createFieldRenderer, fakeConditions, fakeNode } from "@lattice-php/lattice/test-support";
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

  it("hides when its visible condition fails", () => {
    renderField(
      fakeNode({
        type: "field.number-input",
        props: {
          name: "qty",
          label: "Qty",
          conditions: fakeConditions({
            visible: [{ field: "type", operator: "eq", value: "order" }],
          }),
        },
      }),
      { type: "quote" },
    );

    expect(screen.queryByLabelText("Qty")).not.toBeInTheDocument();
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
    expect(screen.getByLabelText("Price")).toHaveClass("rounded-l-none");
  });
});

describe("NumberInputComponent defaults", () => {
  it("renders a slider without a label, min, max or step", () => {
    renderField(fakeNode({ type: "field.number-input", props: { name: "level", slider: true } }), {
      level: "3",
    });

    const slider = screen.getByRole("slider");
    expect(slider).toHaveValue("3");
    expect(slider).not.toHaveAttribute("min");
    expect(slider).not.toHaveAttribute("max");
    expect(slider).not.toHaveAttribute("step");
  });

  it("renders a bare number input when only a name is provided", () => {
    renderField(fakeNode({ type: "field.number-input", props: { name: "qty" } }));

    const input = document.querySelector('input[name="qty"]')!;
    expect(input).toHaveAttribute("type", "number");
    expect(input).not.toHaveAttribute("min");
  });
});
