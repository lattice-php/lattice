type FieldScopeValue = {
    row: Record<string, unknown>;
    rowId: string | null;
    path: string;
    values: Record<string, unknown>;
    identityPath: string;
    getValue: (name: string) => unknown;
    setValue: (name: string, value: unknown) => void;
    scopedName: (name: string) => string;
    errorKey: (name: string) => string;
    overrideKey: (name: string) => string;
};
export declare function FieldScopeProvider({ base, index, row, onChange, children, }: {
    base: string;
    index: number;
    row: Record<string, unknown>;
    onChange: (name: string, value: unknown) => void;
    children: React.ReactNode;
}): import("react").JSX.Element;
/** Null outside a row so callers can preserve top-level behavior without a wrapper. */
export declare function useFieldScope(): FieldScopeValue | null;
export {};
