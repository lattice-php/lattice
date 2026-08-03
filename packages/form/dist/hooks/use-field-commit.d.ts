import { ReactNode } from 'react';
type FieldCommit = {
    /** Write the value and validate immediately (precognitive) or clear errors. */
    commit: (name: string, value: unknown) => void;
    /** Write the value and clear errors, deferring validation to a later `blur`. */
    change: (name: string, value: unknown) => void;
    /** Validate the field now if precognitive (e.g. on blur or popover close). */
    blur: (name: string) => void;
};
export declare function FieldCommitOverrideProvider({ children, value, }: {
    children: ReactNode;
    value: FieldCommit;
}): import('react').FunctionComponentElement<import('react').ProviderProps<FieldCommit | null>>;
/**
 * The shared field-mutation contract every form field uses to write its value
 * and drive precognition. Fields that validate on change call `commit`; fields
 * that validate on blur/close (rich editor, select) call `change` then `blur`.
 *
 * When called inside a `FieldScopeProvider`, writes go through the scope's
 * `setValue` and error paths use the scoped dot-key; outside a scope the
 * behavior is identical to before.
 */
export declare function useFieldCommit(): FieldCommit;
export {};
