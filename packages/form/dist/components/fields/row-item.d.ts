import { ReactNode } from 'react';
import { Node } from '@lattice-php/core/types';
import { RowAction as WireRowAction } from '@lattice-php/core/generated';
import { RepeaterRow } from './repeater-rows.js';
export declare function RowButton({ label, testId, onClick, children, }: {
    label: string;
    testId: string;
    onClick: () => void;
    children: ReactNode;
}): import("react").JSX.Element;
type RowItemProps = {
    base: string;
    index: number;
    row: RepeaterRow;
    template: Node[];
    heading: string;
    reorderable: boolean;
    isFirst: boolean;
    isLast: boolean;
    removable: boolean;
    rowActions: WireRowAction[] | null;
    onField: (index: number, field: string, value: unknown) => void;
    onRemove: (index: number) => void;
    onMove: (index: number, delta: number) => void;
    onDuplicate: (index: number) => void;
};
export declare const RowItem: import('react').MemoExoticComponent<({ base, index, row, template, heading, reorderable, isFirst, isLast, removable, rowActions, onField, onRemove, onMove, onDuplicate, }: RowItemProps) => import("react").JSX.Element>;
export {};
