import { Node } from '@lattice-php/core/types';
export declare function ResolvedNodesProvider({ nodes, children, }: {
    nodes: Record<string, Node>;
    children: React.ReactNode;
}): import("react").JSX.Element;
export declare function useResolvedNode(node: Node): Node;
