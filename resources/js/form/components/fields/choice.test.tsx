import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormValuesProvider } from "../values";
import { ChoiceComponent } from "./choice";

describe("Lattice form choice component", () => {
  it("renders choices and selects on click", () => {
    const node = fakeNode({
      props: {
        label: "Plan",
        name: "plan",
        options: [
          { label: "Free", value: "free" },
          { label: "Pro", value: "pro" },
        ],
        value: "free",
      },
      type: "field.choice",
    });

    render(
      <FormValuesProvider initial={{}}>
        <ChoiceComponent node={node}>{null}</ChoiceComponent>
      </FormValuesProvider>,
    );

    expect(screen.getByLabelText("Plan")).toBeVisible();
    expect(screen.getByRole("radio", { name: "Free" })).toHaveAttribute("aria-checked", "true");

    fireEvent.click(screen.getByRole("radio", { name: "Pro" }));

    expect(screen.getByRole("radio", { name: "Pro" })).toHaveAttribute("aria-checked", "true");
  });
});
