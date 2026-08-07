import { render, type RenderResult } from "@testing-library/react";
import { createElement, type ComponentType, type ReactNode } from "react";
import type { Node } from "@lattice-php/core/types";
import { FormProvider, type FormContextValue } from "./hooks/context";
import { FieldScopeProvider } from "./hooks/field-scope";
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
 * every field component expects. Pass `errors` to surface validation state,
 * `context` to override the form context, and `scope` to render inside a
 * repeater-style row scope.
 */
export function renderWithForm(
  ui: ReactNode,
  {
    initial = {},
    errors = {},
    context = {},
    scope,
  }: {
    initial?: Record<string, unknown>;
    errors?: Record<string, string>;
    context?: Partial<FormContextValue>;
    scope?: { base: string; index: number; row: Record<string, unknown> };
  } = {},
): RenderResult {
  const children = scope
    ? createElement(FieldScopeProvider, { ...scope, onChange: () => {}, children: ui })
    : ui;

  return render(
    createElement(FormProvider, {
      value: fakeFormContext({ ...context, errors }),
      children: createElement(FormValuesProvider, { initial, children }),
    }),
  );
}

export function createFieldRenderer<TType extends string>(
  Component: ComponentType<{ children: ReactNode; node: Node<TType> }>,
): (node: Node<TType>, initial?: Record<string, unknown>) => RenderResult {
  return (node, initial = {}) => renderField(Component, node, initial);
}
