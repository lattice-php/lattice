import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormProvider } from "@lattice-php/lattice/form/hooks/context";
import type { FormContextValue } from "@lattice-php/lattice/form/hooks/context";
import { fakeFormContext } from "@lattice-php/lattice/test-support";
import { FormSubmitButton } from "./submit-button";

function renderSubmit(overrides: Partial<FormContextValue> = {}) {
  return render(
    <FormProvider value={fakeFormContext(overrides)}>
      <FormSubmitButton label="Save" summaryLabel="Fix these fields" />
    </FormProvider>,
  );
}

describe("FormSubmitButton", () => {
  it("renders an enabled submit button when the form is valid", () => {
    renderSubmit();

    const button = screen.getByTestId("form-submit");
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent("Save");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("links the button to its form via the component id", () => {
    renderSubmit({ componentId: "checkout" });

    expect(screen.getByTestId("form-submit")).toHaveAttribute("data-lattice-form", "checkout");
  });

  it("disables the button and shows a spinner while processing", () => {
    renderSubmit({ processing: true });

    const button = screen.getByTestId("form-submit");
    expect(button).toBeDisabled();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("disables the button and summarises invalid fields when there are errors", () => {
    renderSubmit({
      errors: { email: "Required", name: undefined },
      fieldLabels: { email: "Email address" },
    });

    expect(screen.getByTestId("form-submit")).toBeDisabled();

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Fix these fields");
    expect(tooltip).toHaveTextContent("Email address");
    expect(tooltip).toHaveTextContent("Required");
  });

  it("falls back to the field name when no label is registered", () => {
    renderSubmit({ errors: { slug: "Taken" } });

    expect(screen.getByRole("tooltip")).toHaveTextContent("slug");
  });
});
