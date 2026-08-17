import { configure, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Node } from "@lattice-php/core";
import { fakeNode } from "@lattice-php/core/test-support";
import type { FormContextValue } from "@lattice-php/form/hooks/context";
import { formFrame, renderWithForm } from "@lattice-php/form/test-support";
import { WizardComponent, WizardStepComponent } from "./wizard";

configure({ testIdAttribute: "data-test" });

const fieldStep = fakeNode({
  type: "wizard-step",
  props: { name: "customer", label: "Customer" },
  schema: [fakeNode({ type: "field.text-input", props: { name: "name" } })],
});
const emptyStep = fakeNode({ type: "wizard-step", props: { name: "review", label: "Review" } });
const wizardNode = (steps: Node<"wizard-step">[]) =>
  fakeNode({ type: "wizard", props: { orientation: "horizontal" }, schema: steps });

function wizardContent(steps: Node<"wizard-step">[]) {
  return (
    <WizardComponent node={wizardNode(steps)}>
      <>
        {steps.map((step) => (
          <WizardStepComponent key={step.props.name} node={step}>
            <div data-test={`content-${step.props.name}`} />
          </WizardStepComponent>
        ))}
      </>
    </WizardComponent>
  );
}

function renderWizard(steps: Node<"wizard-step">[], context: Partial<FormContextValue> = {}) {
  return renderWithForm(wizardContent(steps), { context });
}

describe("WizardComponent", () => {
  it("mounts only the first step initially and keeps visited steps mounted", () => {
    const validateFields = vi.fn((_fields, options) => options?.onSuccess?.());
    renderWizard([fieldStep, emptyStep], { validateFields });

    expect(screen.getByTestId("content-customer")).toBeInTheDocument();
    expect(screen.queryByTestId("content-review")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("wizard-next"));

    expect(screen.getByTestId("content-review")).toBeInTheDocument();
    expect(screen.getByTestId("content-customer")).toBeInTheDocument();
    expect(screen.getByTestId("content-customer").closest("section")).toHaveAttribute("hidden");
  });

  it("validates the step fields before advancing", () => {
    const touch = vi.fn();
    const validateFields = vi.fn();
    renderWizard([fieldStep, emptyStep], { touch, validateFields });

    fireEvent.click(screen.getByTestId("wizard-next"));

    expect(touch).toHaveBeenCalledWith(["name", "name.*"]);
    expect(validateFields).toHaveBeenCalledWith(["name", "name.*"], expect.any(Object));
    expect(screen.queryByTestId("content-review")).not.toBeInTheDocument();
  });

  it("advances a fieldless step without a validation round-trip", () => {
    const validateFields = vi.fn();
    renderWizard([emptyStep, fieldStep], { validateFields });

    fireEvent.click(screen.getByTestId("wizard-next"));

    expect(validateFields).not.toHaveBeenCalled();
    expect(screen.getByTestId("content-customer")).toBeInTheDocument();
  });

  it("shows the finish button only on the last step", () => {
    renderWizard([emptyStep, fieldStep]);

    expect(screen.queryByTestId("wizard-finish")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("wizard-next"));

    expect(screen.getByTestId("wizard-finish")).toBeInTheDocument();
    expect(screen.queryByTestId("wizard-next")).not.toBeInTheDocument();
  });

  it("jumps back to the first errored step and badges it after a failed submit", () => {
    const validateFields = vi.fn((_fields, options) => options?.onSuccess?.());
    const steps = [fieldStep, emptyStep];
    const { rerender } = renderWizard(steps, { validateFields });

    fireEvent.click(screen.getByTestId("wizard-next"));
    expect(screen.getByTestId("content-review")).toBeInTheDocument();

    rerender(formFrame(wizardContent(steps), { context: { validateFields, processing: true } }));
    rerender(
      formFrame(wizardContent(steps), {
        context: { validateFields, processing: false, errors: { name: "Required" } },
      }),
    );

    expect(screen.getByTestId("content-customer").closest("section")).not.toHaveAttribute("hidden");
    expect(screen.getByTestId("content-review").closest("section")).toHaveAttribute("hidden");
    expect(screen.getByTestId("wizard-rail-customer")).toHaveAttribute("data-error");
  });

  it("centers the rail when the wizard asks for it", () => {
    const centered = fakeNode({
      type: "wizard",
      props: { orientation: "horizontal", align: "center" },
      schema: [emptyStep],
    });

    renderWithForm(<WizardComponent node={centered}>{null}</WizardComponent>);

    expect(screen.getByTestId("wizard-rail-review").closest("ol")).toHaveClass("justify-center");
  });
});
