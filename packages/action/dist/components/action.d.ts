import { Node } from '@lattice-php/core/generated';
import { ReactNode } from 'react';
declare const ActionComponent: ({ node }: {
    children: ReactNode;
    node: Node<"action">;
}) => import("react").JSX.Element;
export default ActionComponent;
