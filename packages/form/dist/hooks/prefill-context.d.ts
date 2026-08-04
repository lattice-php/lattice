export type PrefillController = {
    markUserEdit: (overrideKey: string) => void;
};
export declare const PrefillProvider: import('react').Provider<PrefillController | null>;
export declare function usePrefillController(): PrefillController | null;
