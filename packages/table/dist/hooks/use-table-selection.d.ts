export declare function useTableSelection(keys: string[]): {
    selectedKeys: string[];
    allMatching: boolean;
    allVisibleSelected: boolean;
    allSelected: boolean;
    active: boolean;
    isSelected: (key: string) => boolean;
    toggle: (key: string) => void;
    toggleAll: () => void;
    selectAllMatching: () => void;
    clear: () => void;
};
