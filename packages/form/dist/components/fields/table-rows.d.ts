import { Node } from '@lattice-php/core/types';
import { ColumnWidth, RowAction as WireRowAction } from '@lattice-php/core/generated';
import { RepeaterRow } from './repeater-rows.js';
export type TableColumn = {
    name: string;
    label: string;
    columnWidth: ColumnWidth;
};
type TableRowModel = {
    key: string;
    index: number;
    row: RepeaterRow;
    template: Node[];
    span: boolean;
    heading?: string;
};
export declare function columnsFromSchema(nodes: Node[]): TableColumn[];
export declare function TableRows({ base, columns, rows, reorderable, removable, rowActions, onField, onMove, onRemove, onDuplicate, registerRow, resizableColumns, resizeIndicator, }: {
    base: string;
    columns: TableColumn[];
    rows: TableRowModel[];
    reorderable: boolean;
    removable: (index: number) => boolean;
    rowActions: WireRowAction[] | null;
    onField: (index: number, field: string, value: unknown) => void;
    onMove: (index: number, delta: number) => void;
    onRemove: (index: number) => void;
    onDuplicate: (index: number) => void;
    registerRow?: (key: string, el: HTMLElement | null) => void;
    resizableColumns?: boolean;
    resizeIndicator?: boolean;
}): import("react").JSX.Element;
export {};
