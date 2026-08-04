import { Node } from '@lattice-php/core/types';
import { FieldState } from '../lib/conditions.js';
export type ControlledField = FieldState & {
    localName: string;
    name: string;
    testId?: string;
    value: string;
    error?: string;
    commit: (value: unknown) => void;
    change: (value: unknown) => void;
    blur: () => void;
};
export declare function useControlledField(node: Node): ControlledField;
