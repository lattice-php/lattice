import type { Node } from "@lattice-php/core";

export type ComponentPropsMap = {
  tree: Tree;
};
export type NodeType = "tree";
export type Tree = {
  activeId: string | null;
  activePath: string[] | null;
  defaultExpanded: string[];
  endpoint: string | null;
  lazy: boolean;
  maxDepth: number | null;
  moveAction: Node<"action"> | Node<"action.bulk"> | null;
  nodes: TreeNodeData[];
  ref: string | null;
  rememberState: boolean;
  revision: number | string | null;
  selectAction: Node<"action"> | Node<"action.bulk"> | null;
};
export type TreeNodeData = {
  readonly acceptsChildren: boolean;
  readonly children: TreeNodeData[];
  readonly class: string | null;
  readonly disabled: boolean;
  readonly hasChildren: boolean;
  readonly href: string | null;
  readonly id: string;
  readonly label: string;
  readonly schema: Node[];
};
