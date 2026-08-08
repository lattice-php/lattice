import { createContext, useContext } from "react";
import type { Node } from "@lattice-php/core";
import { fieldProps } from "@lattice-php/form/lib/field-props";
import { useFieldScope } from "./field-scope";

const ResolvedNodesContext = createContext<Record<string, Node>>({});

export function ResolvedNodesProvider({
  nodes,
  children,
}: {
  nodes: Record<string, Node>;
  children: React.ReactNode;
}) {
  return <ResolvedNodesContext.Provider value={nodes}>{children}</ResolvedNodesContext.Provider>;
}

export function useResolvedNode<TType extends string = string>(node: Node<TType>): Node<TType> {
  const nodes = useContext(ResolvedNodesContext);
  const name = fieldProps(node).name ?? "";
  const scope = useFieldScope();
  const path = name && scope ? scope.errorKey(name) : name;

  return ((path && nodes[path]) || (name && nodes[name]) || node) as Node<TType>;
}
