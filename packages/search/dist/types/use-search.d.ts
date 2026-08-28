import { SearchResult } from './generated';
import { UseSearchOptions, UseSearchReturn } from './types';
export declare function searchResultKey(result: SearchResult): string;
export declare function useSearch({ endpoint, perPage }: UseSearchOptions): UseSearchReturn;
