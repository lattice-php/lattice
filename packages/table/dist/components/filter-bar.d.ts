import { Option } from '@lattice-php/core/generated';
import { FilterClause, FilterIndicator, FilterNode, TableColumn } from '../types.js';
export declare function FilterBar({ clauses, columnsByKey, indicators, processing, onRemoveClause, onChange, onReset, }: {
    clauses: FilterClause[];
    columnsByKey: Map<string, TableColumn>;
    indicators: FilterIndicator[];
    processing: boolean;
    onRemoveClause: (index: number) => void;
    onChange: (key: string, value: unknown) => void;
    onReset: () => void;
}): import("react").JSX.Element | null;
export declare function FilterMenu({ filters, values, processing, onChange, onSearch, }: {
    filters: FilterNode[];
    values: Record<string, unknown>;
    processing: boolean;
    onChange: (key: string, value: unknown) => void;
    onSearch?: (searchKey: string, query: string, signal?: AbortSignal) => Promise<Option[]>;
}): import("react").JSX.Element;
