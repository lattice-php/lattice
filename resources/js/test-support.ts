import type { Node, PropsOf, Schema } from "./core/types";

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
