export type SetFormValue = (name: string, value: unknown | ((previous: unknown) => unknown)) => void;
export type ResetFormValues = (fields?: string[]) => void;
export declare function FormValuesProvider({ initial, children, }: {
    initial: Record<string, unknown>;
    children: React.ReactNode;
}): import("react").JSX.Element;
export declare function useFormValues(): Record<string, unknown>;
export declare function useFormValue(name: string): unknown;
export declare function useFormValuesFor(paths: string[]): Record<string, unknown>;
export declare function useSetFormValue(): SetFormValue;
/**
 * Reset values to the store's initial snapshot — all of them, or just the
 * given field paths. This is the reset that actually clears controlled
 * fields; Inertia's own form reset only touches its internal data and the
 * DOM, which store-driven inputs ignore.
 */
export declare function useResetFormValues(): ResetFormValues;
