import { render, waitFor, type RenderResult } from "@testing-library/react";
import { createElement, type ComponentType, type ReactElement, type ReactNode } from "react";
import { expect } from "vitest";
import type { Registry } from "@lattice-php/core/registry";
import { RegistryContext } from "@lattice-php/core/registry-context";
import { fakeNode } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import type { EditorExtension } from "./generated";
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

type FormFrameOptions = {
  initial?: Record<string, unknown>;
  errors?: FormContextValue["errors"];
  context?: Partial<FormContextValue>;
  scope?: { base: string; index: number; row: Record<string, unknown> };
  registry?: Registry;
};

/**
 * Builds the element tree `renderWithForm` renders: a no-op form context plus
 * a values store, optionally inside a repeater-style row `scope` and a
 * component `registry`. Browser suites render this with vitest-browser-react.
 */
export function formFrame(
  ui: ReactNode,
  { initial = {}, errors = {}, context = {}, scope, registry }: FormFrameOptions = {},
): ReactElement {
  const children = scope
    ? createElement(FieldScopeProvider, { ...scope, onChange: () => {}, children: ui })
    : ui;

  const form = createElement(FormProvider, {
    value: fakeFormContext({ errors, ...context }),
    children: createElement(FormValuesProvider, { initial, children }),
  });

  return registry
    ? createElement(RegistryContext.Provider, { value: registry, children: form })
    : form;
}

/**
 * Renders `ui` inside the frame every field component expects. Pass `errors`
 * to surface validation state, `context` to override the form context,
 * `scope` to render inside a repeater-style row scope, and `registry` when
 * the component resolves nodes or extensions through the registry.
 */
export function renderWithForm(ui: ReactNode, options: FormFrameOptions = {}): RenderResult {
  return render(formFrame(ui, options));
}

export function createFieldRenderer<TType extends string>(
  Component: ComponentType<{ children: ReactNode; node: Node<TType> }>,
): (node: Node<TType>, initial?: Record<string, unknown>) => RenderResult {
  return (node, initial = {}) => renderField(Component, node, initial);
}

export async function findNamedInput(name: string): Promise<HTMLInputElement> {
  let input: HTMLInputElement | null = null;

  await waitFor(() => {
    input = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);

    expect(input).toBeInstanceOf(HTMLInputElement);
  });

  if (!input) {
    throw new Error(`Input ${name} was not rendered.`);
  }

  return input;
}

/** The full built-in extension set as the server wires it. */
export const RICH_EDITOR_EXTENSIONS: EditorExtension[] = [
  { type: "bold", props: {} },
  { type: "italic", props: {} },
  { type: "strike", props: {} },
  { type: "underline", props: {} },
  { type: "highlight", props: {} },
  { type: "code", props: {} },
  { type: "heading", props: {} },
  { type: "bullet-list", props: {} },
  { type: "ordered-list", props: {} },
  { type: "blockquote", props: {} },
  { type: "code-block", props: {} },
  { type: "horizontal-rule", props: {} },
  { type: "text-align", props: {} },
  { type: "link", props: {} },
  { type: "table", props: {} },
  { type: "details", props: {} },
  { type: "emoji", props: {} },
];

export function priceField(): Node {
  return fakeNode({
    type: "field.text-input",
    props: {
      name: "price",
      editablePrefill: true,
      prefillRefreshOn: ["@customer"],
      prefillResetOn: ["product"],
    },
  });
}

export function builderNode(): Node {
  return Object.assign(
    fakeNode({ id: "builder", type: "field.builder", props: { name: "items" } }),
    { templates: [{ type: "product", label: "Product", schema: [priceField()] }] },
  );
}
