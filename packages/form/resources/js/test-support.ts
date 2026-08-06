import { render, type RenderResult } from "@testing-library/react";
import { createElement, type ComponentType, type ReactNode } from "react";
import type { Node } from "@lattice-php/core/types";
import type { FieldConditions } from "./generated";
import { FormProvider, type FormContextValue } from "./hooks/context";
import { FormValuesProvider } from "./hooks/values";

/** A complete no-op form context; override only what a case asserts on. */
export function fakeFormContext(overrides: Partial<FormContextValue> = {}): FormContextValue {
  return {
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
  };
}

/** Fill the intents a case omits so a partial reads as the full wire `conditions` shape. */
export function fakeConditions(partial: Partial<FieldConditions>): FieldConditions {
  return { visible: [], required: [], readOnly: [], disabled: [], ...partial };
}

export function renderField<TType extends string>(
  Component: ComponentType<{ children: ReactNode; node: Node<TType> }>,
  node: Node<TType>,
  initial: Record<string, unknown> = {},
): RenderResult {
  return render(
    createElement(FormValuesProvider, {
      initial,
      children: createElement(Component, { node, children: null }),
    }),
  );
}

/**
 * Renders `ui` inside a no-op form context plus a values store — the frame
 * every field component expects. Pass `errors` to surface validation state.
 */
export function renderWithForm(
  ui: ReactNode,
  initial: Record<string, unknown> = {},
  errors: Record<string, string> = {},
): RenderResult {
  return render(
    createElement(FormProvider, {
      value: fakeFormContext({ errors }),
      children: createElement(FormValuesProvider, { initial, children: ui }),
    }),
  );
}

export function createFieldRenderer<TType extends string>(
  Component: ComponentType<{ children: ReactNode; node: Node<TType> }>,
): (node: Node<TType>, initial?: Record<string, unknown>) => RenderResult {
  return (node, initial = {}) => renderField(Component, node, initial);
}
