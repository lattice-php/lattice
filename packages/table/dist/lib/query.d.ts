import { ColumnWidth } from '@lattice-php/core/generated';
import { TableColumn, TableSort, TableQuery } from '../types.js';
export declare function getColumnSort(query: TableQuery, column: TableColumn): TableSort | undefined;
export declare function getColumnAriaSort(sort: TableSort | undefined): "ascending" | "descending" | undefined;
export declare function buildEndpoint(endpoint: string, query: TableQuery): string;
export declare function getQueryParams(query: TableQuery): Record<string, unknown>;
export declare const VALUELESS_FILTER_OPERATORS: Set<string>;
export declare function operatorLabel(operator: string): string;
export declare function getSortDirectionLabel(direction: string): string;
export declare function nextSort(sorts: TableSort[], column: TableColumn): TableSort[];
export declare function getVisiblePages(currentPage: number, lastPage: number): number[];
export declare function getTableSizingColumns(columns: TableColumn[]): {
    key: string;
    label: string | null;
    width: ColumnWidth;
}[];
export declare function getTableUtilityTracks(hasActions: boolean, hasSelection: boolean, hasExpander?: boolean): {
    leadingTracks: string[];
    trailingTracks: string[];
};
