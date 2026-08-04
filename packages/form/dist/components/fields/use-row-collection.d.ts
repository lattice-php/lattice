import { RepeaterRow } from './repeater-rows.js';
type RowCollection = {
    path: string;
    rows: RepeaterRow[];
    onField: (index: number, field: string, value: unknown) => void;
    onRemove: (index: number) => void;
    onMove: (index: number, delta: number) => void;
    onDuplicate: (index: number) => void;
    append: (row: RepeaterRow) => void;
};
export declare function useRowCollection(name: string, defaultItems: number): RowCollection;
export {};
