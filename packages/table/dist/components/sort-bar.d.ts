import { TableColumn, TableSort, TableQuery } from '../types.js';
export declare function SortBar({ columnsByKey, query, processing, onClear, }: {
    columnsByKey: Map<string, TableColumn>;
    query: TableQuery;
    processing: boolean;
    onClear: (sort: TableSort) => void;
}): import("react").JSX.Element;
