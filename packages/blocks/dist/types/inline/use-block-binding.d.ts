import { Node } from '@lattice-php/core';
import { BoundField } from '../document/bindings';
import { BlockContextValue } from '../components/editor/block-context';
export type BlockBinding = {
    block: BlockContextValue;
    field: BoundField;
    value: unknown;
};
/**
 * Resolve the field a rendered node is bound to, for nodes inside a block on
 * the editor canvas. Null when the node is unbound, sits outside a block, or
 * names a field the block type does not declare.
 */
export declare function useBlockBinding(node: Node): BlockBinding | null;
