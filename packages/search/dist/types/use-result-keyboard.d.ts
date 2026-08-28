import { KeyboardEvent } from 'react';
import { SearchResult } from './types';
export declare function searchResultDomId(instanceId: string, result: SearchResult): string;
export declare function useResultKeyboard(results: SearchResult[]): (event: KeyboardEvent<HTMLElement>) => void;
