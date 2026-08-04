export type ToggleableColumn = {
    key: string;
    props: {
        label?: string | null;
        toggleable?: boolean;
        hiddenByDefault?: boolean;
    };
};
export declare function useColumnVisibility<TColumn extends ToggleableColumn>({ columns, storageKey, }: {
    columns: TColumn[];
    storageKey?: string;
}): {
    hasHidden: boolean;
    hasToggleableColumns: boolean;
    isVisible: (column: ToggleableColumn) => boolean;
    resetVisibility: () => void;
    setColumnVisible: (key: string, visible: boolean) => void;
    toggleableColumns: TColumn[];
    visibleColumns: TColumn[];
};
