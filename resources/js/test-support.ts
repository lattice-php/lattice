import { render, type RenderResult } from "@testing-library/react";
import { createElement, type ComponentType, type ReactNode } from "react";
import type { Node, PropsOf, Schema } from "./core/types";
import { FormValuesProvider } from "./form/hooks/values";

/**
 * Build a node fixture for tests with only the props a case cares about. The wire
 * always carries the full prop object, but component reads default what's omitted,
 * so partial props are safe here. Prop names stay checked against the node's
 * generated type via `Partial<PropsOf<T>>`.
 */
export function fakeNode<TType extends string>(node: {
  type: TType;
  id?: string;
  key?: string;
  schema?: Schema;
  props?: Partial<PropsOf<TType>>;
}): Node<TType> {
  return node as unknown as Node<TType>;
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

export function createFieldRenderer<TType extends string>(
  Component: ComponentType<{ children: ReactNode; node: Node<TType> }>,
): (node: Node<TType>, initial?: Record<string, unknown>) => RenderResult {
  return (node, initial = {}) => renderField(Component, node, initial);
}
