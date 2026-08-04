import { Option } from '@lattice-php/core/generated';
import { FilterClause, TableColumn } from '../types.js';
type ColumnClause = {
    clause: FilterClause;
    index: number;
};
export declare function ColumnFilterControl({ column, clauses, processing, onAdd, onUpdate, onRemove, onReplace, onSearch, }: {
    column: TableColumn;
    clauses: ColumnClause[];
    processing: boolean;
    onAdd: (clause: FilterClause) => void;
    onUpdate: (index: number, clause: FilterClause) => void;
    onRemove: (index: number) => void;
    onReplace: (field: string, clauses: FilterClause[]) => void;
    onSearch?: (query: string, signal?: AbortSignal) => Promise<Option[]>;
}): import("react").JSX.Element | null;
export {};
