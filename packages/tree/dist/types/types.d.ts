import { ComponentPropsMap } from "./generated";
declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}
export type { NodeType as TreeNodeType, Tree, TreeNodeData } from "./generated";
