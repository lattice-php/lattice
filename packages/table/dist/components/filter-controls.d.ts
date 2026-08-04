import { Option } from '@lattice-php/core/types';
import { FilterNode } from '../types.js';
export type FilterOptionSearch = (field: string, query: string, signal: AbortSignal) => Promise<Option[]>;
export declare function TableFilterControl({ filter, value, processing, bare, onChange, onSearch, }: {
    filter: FilterNode;
    value: unknown;
    processing: boolean;
    bare?: boolean;
    onChange: (value: unknown) => void;
    onSearch?: FilterOptionSearch;
}): import("react").JSX.Element;
