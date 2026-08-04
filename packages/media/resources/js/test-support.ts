import type { ComponentPropsOf, Node, Schema } from "@lattice-php/core/types";
import type { FormContextValue } from "@lattice-php/form/hooks/context";

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

/**
 * Build a node fixture with only the props a case cares about. The wire always
 * carries the full prop object, but component reads default what's omitted, so
 * partial props are safe here — while prop names stay checked against the
 * node's generated type.
 */
export function fakeNode<TType extends string>(node: {
  type: TType;
  id?: string;
  key?: string;
  schema?: Schema;
  props?: Partial<ComponentPropsOf<TType>>;
}): Node<TType> {
  return node as unknown as Node<TType>;
}
