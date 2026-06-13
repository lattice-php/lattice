import { createContext, useContext } from "react";
import type { Node } from "@lattice-php/lattice/core/types";
import { fieldProps } from "./field-props";

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

export function useResolvedNode(node: Node): Node {
  const nodes = useContext(ResolvedNodesContext);
  const name = fieldProps(node).name ?? "";

  return name && nodes[name] ? nodes[name] : node;
}
