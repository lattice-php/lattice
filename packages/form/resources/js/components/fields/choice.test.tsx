import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { FormValuesProvider, useFormValue } from "@lattice-php/form/hooks/values";
import { ChoiceComponent } from "./choice";

function StoredValue({ name }: { name: string }) {
  return <span data-test="stored">{String(useFormValue(name))}</span>;
}

describe("Lattice form choice component", () => {
  it("renders choices and selects on click", () => {
    const node = fakeNode({
      props: {
        label: "Plan",
        name: "plan",
        options: [
          { label: "Free", value: "free", data: null },
          { label: "Pro", value: "pro", data: null },
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

  // A field the server left empty arrives as `null`, not as a missing key, so the
  // seeded default has to overwrite it — otherwise the store disagrees with the
  // option the user sees checked, and a field depending on it resolves against
  // nothing.
  it("seeds the preselected option over a null stored value", () => {
    const node = fakeNode({
      props: {
        label: "Plan",
        name: "plan",
        options: [
          { label: "Free", value: "free", data: null },
          { label: "Pro", value: "pro", data: null },
        ],
        value: null,
      },
      type: "field.choice",
    });

    render(
      <FormValuesProvider initial={{ plan: null }}>
        <ChoiceComponent node={node}>{null}</ChoiceComponent>
        <StoredValue name="plan" />
      </FormValuesProvider>,
    );

    expect(screen.getByTestId("stored")).toHaveTextContent("free");
  });
});
