import { RefObject } from 'react';
import { TreeNodeData } from './tree.js';
export declare const ROOTS_KEY = "";
export type TreeItemRegistration = {
    id: string;
    label: string;
    orderPath: string;
    parentPath: string | null;
    path: string;
    ref: RefObject<HTMLLIElement | null>;
};
export type TreeFocusDirection = "first" | "firstChild" | "last" | "next" | "parent" | "prev";
export type TreeContextValue = {
    activate: (id: string) => void;
    activeId: string | null;
    canLoad: boolean;
    childrenFor: (id: string) => TreeNodeData[] | undefined;
    expanded: Set<string>;
    focus: (id: string) => void;
    focusedId: string | null;
    isLoading: (id: string) => boolean;
    loadChildren: (id: string) => void;
    moveFocus: (fromId: string, direction: TreeFocusDirection) => void;
    register: (entry: TreeItemRegistration) => void;
    toggle: (id: string) => void;
    typeAhead: (fromId: string, character: string) => void;
    unregister: (path: string) => void;
};
export declare const TreeContext: import('react').Context<TreeContextValue>;
export declare function useTreeContext(): TreeContextValue;
export declare function useTreeState({ activeId: initialActiveId, defaultExpanded, endpoint, componentRef, lazy, nodes, rememberState, storageKey, }: {
    activeId: string | null;
    defaultExpanded: string[];
    endpoint: string | null;
    componentRef: string | null;
    lazy: boolean;
    nodes: Array<{
        id: string;
    }>;
    rememberState: boolean;
    storageKey: string;
}): TreeContextValue;
