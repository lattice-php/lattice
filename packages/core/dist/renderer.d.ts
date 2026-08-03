import { ReactNode } from 'react';
import { Node } from './index.js';
export declare function Renderer({ nodes }: {
    nodes: Node[];
}): ReactNode;
export declare function RenderNode({ node }: {
    node: Node;
}): ReactNode;
