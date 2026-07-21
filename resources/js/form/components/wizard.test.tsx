import { configure, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { FormProvider } from "@lattice-php/lattice/form/hooks/context";
import { FormValuesProvider } from "@lattice-php/lattice/form/hooks/values";
import { WizardComponent, WizardStepComponent } from "./wizard";

configure({ testIdAttribute: "data-test" });

const node = <TType extends string>(
  type: TType,
  props: Record<string, unknown>,
  schema: Node[] = [],
): Node<TType> => ({ type, props, schema }) as unknown as Node<TType>;

const fieldStep = node("wizard-step", { name: "customer", label: "Customer" }, [
  node("field.text-input", { name: "name" }),
]);
const emptyStep = node("wizard-step", { name: "review", label: "Review" });
const wizardNode = (steps: Node<"wizard-step">[]) =>
  node("wizard", { orientation: "horizontal" }, steps);

const formStub = (overrides: Partial<Parameters<typeof FormProvider>[0]["value"]> = {}) => ({
  action: "#",
  clearErrors: () => {},
  componentRef: "",
  errors: {},
  fieldLabels: {},
  precognitive: false,
  processing: false,
  touch: () => {},
  validate: () => {},
  validateFields: () => {},
  validating: false,
  ...overrides,
});

function wizardTree(steps: Node<"wizard-step">[], stub: ReturnType<typeof formStub>) {
  return (
    <FormProvider value={stub}>
      <FormValuesProvider initial={{}}>
        <WizardComponent node={wizardNode(steps)}>
          <>
            {steps.map((step) => (
              <WizardStepComponent key={step.props.name} node={step}>
                <div data-test={`content-${step.props.name}`} />
              </WizardStepComponent>
            ))}
          </>
        </WizardComponent>
      </FormValuesProvider>
    </FormProvider>
  );
}

function renderWizard(steps: Node<"wizard-step">[], stub = formStub()) {
  return render(wizardTree(steps, stub));
}

describe("WizardComponent", () => {
  it("mounts only the first step initially and keeps visited steps mounted", () => {
    const validateFields = vi.fn((_fields, options) => options?.onSuccess?.());
    renderWizard([fieldStep, emptyStep], formStub({ validateFields }));

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
    renderWizard([fieldStep, emptyStep], formStub({ touch, validateFields }));

    fireEvent.click(screen.getByTestId("wizard-next"));

    expect(touch).toHaveBeenCalledWith(["name", "name.*"]);
    expect(validateFields).toHaveBeenCalledWith(["name", "name.*"], expect.any(Object));
    expect(screen.queryByTestId("content-review")).not.toBeInTheDocument();
  });

  it("advances a fieldless step without a validation round-trip", () => {
    const validateFields = vi.fn();
    renderWizard([emptyStep, fieldStep], formStub({ validateFields }));

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
    const { rerender } = renderWizard(steps, formStub({ validateFields }));

    fireEvent.click(screen.getByTestId("wizard-next"));
    expect(screen.getByTestId("content-review")).toBeInTheDocument();

    rerender(wizardTree(steps, formStub({ validateFields, processing: true })));
    rerender(
      wizardTree(
        steps,
        formStub({ validateFields, processing: false, errors: { name: "Required" } }),
      ),
    );

    expect(screen.getByTestId("content-customer").closest("section")).not.toHaveAttribute("hidden");
    expect(screen.getByTestId("content-review").closest("section")).toHaveAttribute("hidden");
    expect(screen.getByTestId("wizard-rail-customer")).toHaveAttribute("data-error");
  });
});
