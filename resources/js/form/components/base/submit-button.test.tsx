import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormProvider } from "../context";
import { FormSubmitButton } from "./submit-button";

type ContextOverrides = {
  errors?: Record<string, string | undefined>;
  fieldLabels?: Record<string, string>;
  processing?: boolean;
  componentId?: string;
};

function renderSubmit(overrides: ContextOverrides = {}) {
  return render(
    <FormProvider
      value={{
        action: "#",
        clearErrors: () => {},
        componentId: overrides.componentId,
        componentRef: "",
        errors: overrides.errors ?? {},
        fieldLabels: overrides.fieldLabels ?? {},
        precognitive: false,
        processing: overrides.processing ?? false,
        validate: () => {},
      }}
    >
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
