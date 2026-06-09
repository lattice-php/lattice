import { createContext, useContext } from "react";
import { getStringProp } from "@lattice/lattice/core/props";
import type { Node } from "@lattice/lattice/core/types";

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
  const name = getStringProp(node.props, "name");

  return name && nodes[name] ? nodes[name] : node;
}
