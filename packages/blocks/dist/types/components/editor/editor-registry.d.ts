import { ReactNode } from "react";
import { Node, Registry } from "@lattice-php/core";
export declare function BaseRegistryProvider({
  registry,
  children,
}: {
  registry: Registry;
  children: ReactNode;
}): import("react").JSX.Element;
/**
 * Render a node with the app's own components, bypassing the editor overrides.
 * Inline editors use it for nodes that are not bound to a field.
 */
export declare function BaseNode({ node }: { node: Node }): import("react").JSX.Element;
/**
 * The canvas renders blocks with the app's own components, swapping only the
 * frame, the slot outlets, and the node types that can carry a field binding
 * for their editing counterparts.
 */
export declare function useEditorRegistry(): {
  registry: Registry;
  base: Registry;
};
