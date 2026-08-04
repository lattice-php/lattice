import { Method } from '@inertiajs/core';
import { Node } from '@lattice-php/core/types';
import { Action, Emphasis, Variant } from '@lattice-php/core/generated';
export type BulkAction = {
    id: string;
    label: string;
    method: Method;
    endpoint: string;
    ref: string;
    variant: Variant | null;
    emphasis: Emphasis | null;
    confirmation: Action["confirmation"];
    form: Node | null;
    modalSide: Action["modalSide"];
    modalWidth: Action["modalWidth"];
};
export declare function getBulkActions(actions: Node[] | undefined): BulkAction[];
