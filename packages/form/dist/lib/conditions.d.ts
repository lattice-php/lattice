import { Condition, FieldConditions } from '@lattice-php/core/generated';
export type { Condition, FieldConditions };
type FieldFlags = {
    hidden?: boolean;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
};
export type FieldState = {
    hidden: boolean;
    required: boolean;
    readOnly: boolean;
    disabled: boolean;
};
export declare function conditionFields(conditions: Partial<FieldConditions> | undefined | null): string[];
export declare function toBoolean(value: unknown): boolean;
export declare function evaluateConditions(conditions: Partial<FieldConditions> | undefined, values: Record<string, unknown>, flags: FieldFlags): FieldState;
