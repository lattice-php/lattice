import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormValuesProvider } from "../values";
import { NumberInputComponent } from "./number-input";

function renderField(node: Node<"field.number-input">, initial: Record<string, unknown> = {}) {
  return render(
    <FormValuesProvider initial={initial}>
      <NumberInputComponent node={node}>{null}</NumberInputComponent>
    </FormValuesProvider>,
  );
}

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
          conditions: { visible: [{ field: "type", operator: "eq", value: "order" }] },
        },
      }),
      { type: "quote" },
    );

    expect(screen.queryByLabelText("Qty")).not.toBeInTheDocument();
  });
});
