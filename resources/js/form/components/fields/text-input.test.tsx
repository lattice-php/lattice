import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormValuesProvider } from "../values";
import { TextInputComponent } from "./text-input";

function renderField(node: Node<"field.text-input">, initial: Record<string, unknown> = {}) {
  return render(
    <FormValuesProvider initial={initial}>
      <TextInputComponent node={node}>{null}</TextInputComponent>
    </FormValuesProvider>,
  );
}

describe("TextInputComponent conditions", () => {
  it("hides when its visible condition fails", () => {
    renderField(
      fakeNode({
        type: "field.text-input",
        props: {
          name: "company",
          label: "Company",
          conditions: { visible: [{ field: "type", operator: "eq", value: "business" }] },
        },
      }),
      { type: "personal" },
    );

    expect(screen.queryByRole("textbox", { name: "Company" })).not.toBeInTheDocument();
  });

  it("shows when its visible condition matches", () => {
    renderField(
      fakeNode({
        type: "field.text-input",
        props: {
          name: "company",
          label: "Company",
          conditions: { visible: [{ field: "type", operator: "eq", value: "business" }] },
        },
      }),
      { type: "business" },
    );

    expect(screen.getByRole("textbox", { name: "Company" })).toBeVisible();
  });

  it("renders helper text beneath the field", () => {
    renderField(
      fakeNode({
        type: "field.text-input",
        props: { name: "price", label: "Price", helperText: "Shown to buyers." },
      }),
    );

    expect(screen.getByText("Shown to buyers.")).toBeVisible();
  });
});
