import { Method } from '@inertiajs/core';
import { ReactNode } from 'react';
import { Effect, Node } from '@lattice-php/core/generated';
type ActionNode = Node<"action" | "action.bulk">;
export type ClickBehavior = {
    kind: "navigate";
    href: string;
    method: Method;
} | {
    kind: "action";
    action: ActionNode;
} | {
    kind: "effects";
    onClick: () => void;
} | {
    kind: "none";
};
export type TriggerState = {
    onClick: () => void;
    processing: boolean;
};
export type ActionTriggerRenderer = (props: {
    action: ActionNode;
    children: (trigger: TriggerState) => ReactNode;
}) => ReactNode;
export declare function ActionTriggerProvider({ children, render, }: {
    children: ReactNode;
    render: ActionTriggerRenderer;
}): import("react").JSX.Element;
export declare function useActionTrigger(): ActionTriggerRenderer | null;
export declare function ActionTrigger({ action, children, }: {
    action: ActionNode;
    children: (trigger: TriggerState) => ReactNode;
}): import("react").JSX.Element;
export declare function useClickBehavior(props: {
    href?: string | null;
    method?: Method | null;
    action?: Node | null;
    effects?: Effect[] | null;
}): ClickBehavior;
export {};
