import { SearchMatch } from './search';
import { PageTextCache } from './text-cache';
export type SearchState = {
    query: string;
    setQuery(query: string): void;
    matches: SearchMatch[];
    currentIndex: number;
    currentMatch: SearchMatch | null;
    next(): void;
    previous(): void;
    matchesForPage(page: number): SearchMatch[];
};
export declare function useSearch(textCache: PageTextCache | null): SearchState;
