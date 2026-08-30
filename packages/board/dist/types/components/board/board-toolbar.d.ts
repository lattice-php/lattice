import { FilterIndicator, FilterNode } from '@lattice-php/table';
import { Option } from '@lattice-php/core';
export type BoardToolbarProps = {
    filters: FilterNode[];
    indicators: FilterIndicator[];
    onReset: () => void;
    onSearch: (term: string) => void;
    onSearchFilterOptions: (searchKey: string, query: string, signal?: AbortSignal) => Promise<Option[]>;
    onTableFilter: (key: string, value: unknown) => void;
    search: string;
    searchable: boolean;
    tableFilters: Record<string, unknown>;
};
export declare function BoardToolbar({ filters, indicators, onReset, onSearch, onSearchFilterOptions, onTableFilter, search, searchable, tableFilters, }: BoardToolbarProps): import("react").JSX.Element | null;
