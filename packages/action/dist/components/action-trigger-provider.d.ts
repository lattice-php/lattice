import { ReactNode } from 'react';
import { Node } from '@lattice-php/core/generated';
import { TriggerState } from '../click-behavior.js';
export declare function ActionTrigger({ action, children, }: {
    action: Node<"action" | "action.bulk">;
    children: (trigger: TriggerState) => ReactNode;
}): import("react").JSX.Element;
export declare function ActionInteractionProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
