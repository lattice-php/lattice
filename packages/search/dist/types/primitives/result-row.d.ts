import { SearchResult } from '../types';
export declare function ResultRow({ result, focused, onOpen, onFocus, id, tabIndex, }: {
    result: SearchResult;
    focused: boolean;
    onOpen: () => void;
    onFocus: () => void;
    id: string;
    tabIndex?: 0 | -1;
}): import("react").JSX.Element;
