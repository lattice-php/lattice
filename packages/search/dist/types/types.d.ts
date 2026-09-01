import { ComponentPropsMap, SearchCategory, SearchPagination, SearchResult } from './generated';
declare module "@lattice-php/core" {
    interface ComponentProps extends ComponentPropsMap {
    }
}
export type { SearchNodeType, RecordSelectionResponse, RecordSelectionState, SearchBox, SearchBox as SearchBoxWireProps, SearchCategory, SearchMode, SearchPagination, SearchResponse, SearchResult, SearchResultCategory, SearchResultItem, SearchState, } from './generated';
export declare const SEARCH_DEBOUNCE_MS = 250;
export type SearchStatus = "idle" | "loading" | "success" | "error";
export type UseSearchOptions = {
    endpoint: string;
    perPage?: number;
};
export type UseSearchReturn = {
    query: string;
    setQuery: (value: string) => void;
    categories: SearchCategory[];
    activeCategory: string | null;
    setCategory: (name: string) => void;
    results: SearchResult[];
    recent: SearchResult[];
    pagination: SearchPagination | null;
    status: SearchStatus;
    error: string | null;
    focusedKey: string | null;
    setFocusedKey: (key: string | null) => void;
    loadMore: () => void;
    openResult: (result: SearchResult) => void;
    refreshRecent: () => void;
};
