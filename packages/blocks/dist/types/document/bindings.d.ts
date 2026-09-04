import { Node } from '@lattice-php/core';
export type BindingKind = "text" | "rich" | "media" | "field";
export type BoundField = {
    name: string;
    kind: BindingKind;
    multiline: boolean;
    placeholder: string | null;
    node: Node;
};
export declare function boundFieldFor(schema: readonly Node[], name: string): BoundField | null;
/** Every field the rendered tree edits inline, in document order. */
export declare function boundFields(node: Node): string[];
/**
 * The inspector schema without the fields that are edited inline. Containers
 * left empty by the filter disappear with their fields.
 */
export declare function unboundSchema(schema: readonly Node[], bound: readonly string[]): Node[];
/** Replace the props of every node bound to `field`; the tree is otherwise shared. */
export declare function patchBinding(node: Node, field: string, patch: (props: Node["props"], node: Node) => Node["props"]): Node;
/**
 * The prop a plain-text edit lands in, by node type: headings and texts show
 * `text`, buttons show `label`. Other node types cannot take a local text patch.
 */
export declare function textPropFor(nodeType: string): "text" | "label" | null;
export declare function patchText(node: Node, field: string, value: string): Node;
export declare function patchDocument(node: Node, field: string, document: Record<string, unknown> | null): Node;
