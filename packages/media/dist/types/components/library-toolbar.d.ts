import { ViewMode } from './media-row';
/** `key:direction`, or an empty string for the definition's own order. */
export type SortChoice = string;
export declare function sortsFor(choice: SortChoice): {
    direction: "asc" | "desc";
    key: string;
}[];
export declare function LibraryToolbar({ accept, defaultSearch, onFiles, onSearch, onSortChange, onTypeChange, onViewChange, sort, sortableKeys, uploadLabel, view, }: {
    accept: string | null;
    defaultSearch: string;
    onFiles: ((files: FileList | null) => void) | null;
    onSearch: (term: string) => void;
    onSortChange: (choice: SortChoice) => void;
    onTypeChange: (type: string) => void;
    onViewChange: ((view: ViewMode) => void) | null;
    sort: SortChoice;
    sortableKeys: string[];
    uploadLabel: string;
    view: ViewMode;
}): import("react").JSX.Element;
