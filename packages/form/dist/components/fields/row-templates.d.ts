import { Node } from '@lattice-php/core/types';
export type RowTemplate = {
    type: string;
    label: string;
    schema: Node[];
};
export declare function rowTemplatesOf(node: Node): RowTemplate[] | undefined;
/** The schema for a submitted row: its matching template, or the node's own schema when untyped. */
export declare function rowSchemaFor(node: Node, row: Record<string, unknown>): Node[];
