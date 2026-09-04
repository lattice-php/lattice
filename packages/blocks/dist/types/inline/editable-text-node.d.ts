import { Node } from '@lattice-php/core';
import { BlockBinding } from './use-block-binding';
/**
 * A heading, text or button whose primary text is bound to a field: the
 * app's component keeps its look, the text inside becomes editable.
 */
export declare function EditableTextNode({ node, binding }: {
    node: Node;
    binding: BlockBinding;
}): import("react").JSX.Element;
