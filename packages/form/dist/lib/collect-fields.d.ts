import { Node } from '@lattice-php/core/types';
export type CollectedFields = {
    labels: Record<string, string>;
    values: Record<string, unknown>;
};
/** Gather the initial label and value of every named field in a schema. */
export declare function collectFields(nodes: Node[] | undefined): CollectedFields;
