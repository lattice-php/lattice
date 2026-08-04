import { RendererComponent, Schema } from '@lattice-php/core';
/**
 * The sparse wire shape a tree node serializes as (see `TreeNode::jsonSerialize()`):
 * every optional/falsy field is omitted rather than sent as `null`/`false`. `schema`
 * is the compiled body — icon/text-or-link/badge/actions — rendered by core's
 * `<Renderer>`; `label` stays a plain string used for typeahead and registry
 * registration, not for rendering.
 */
export type TreeNodeData = {
    readonly id: string;
    readonly label: string;
    schema: Schema;
    href?: string;
    disabled?: boolean;
    hasChildren?: boolean;
    children?: TreeNodeData[];
};
export type TreeWireProps = {
    activeId: string | null;
    defaultExpanded: string[];
    rememberState: boolean;
    nodes: TreeNodeData[];
    ref: string | null;
    endpoint: string | null;
    lazy: boolean;
};
declare module "@lattice-php/core" {
    interface ComponentProps {
        tree: TreeWireProps;
    }
}
declare const TreeComponent: RendererComponent<"tree">;
export default TreeComponent;
