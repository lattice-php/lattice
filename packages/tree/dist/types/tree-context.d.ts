import { RefObject } from "react";
import { Tree, TreeNodeData } from "./types";
export declare const ROOTS_KEY = "";
export type TreeMoveRequest = {
  nodeId: string;
  parentId: string | null;
  position: number;
};
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
  canDropOn: (sourceId: string, targetId: string) => boolean;
  canLoad: boolean;
  canMove: boolean;
  canPlace: (sourceId: string, parentId: string | null) => boolean;
  childrenCount: (id: string | null) => number;
  childrenFor: (id: string) => TreeNodeData[] | undefined;
  expand: (id: string) => void;
  expanded: Set<string>;
  focus: (id: string) => void;
  focusedId: string | null;
  isLoaded: (id: string) => boolean;
  isLoading: (id: string) => boolean;
  loadChildren: (id: string) => Promise<void>;
  move: (request: TreeMoveRequest) => Promise<boolean>;
  moveFocus: (fromId: string, direction: TreeFocusDirection) => void;
  moving: boolean;
  parentFor: (id: string) => string | null;
  positionFor: (id: string) => number;
  register: (entry: TreeItemRegistration) => void;
  reload: () => void;
  toggle: (id: string) => void;
  typeAhead: (fromId: string, character: string) => void;
  unregister: (path: string) => void;
};
export declare const TreeContext: import("react").Context<TreeContextValue>;
export declare function useTreeContext(): TreeContextValue;
export declare function useTreeState({
  activeId: controlledActiveId,
  activePath,
  defaultExpanded,
  endpoint,
  componentRef,
  lazy,
  maxDepth,
  nodes,
  moveAction,
  rememberState,
  revision,
  selectAction,
  storageKey,
}: {
  activeId: string | null;
  activePath: string[] | null;
  defaultExpanded: string[];
  endpoint: string | null;
  componentRef: string | null;
  lazy: boolean;
  maxDepth: number | null;
  nodes: TreeNodeData[];
  moveAction: Tree["moveAction"];
  rememberState: boolean;
  revision: string | number | null;
  selectAction: Tree["selectAction"];
  storageKey: string;
}): TreeContextValue;
