import { ReactNode } from 'react';
import { MediaRow } from './media-row';
export type RowListProps = {
    activeId: number | null;
    isSelected: (row: MediaRow) => boolean;
    onActivate: (row: MediaRow, index: number, shiftKey: boolean) => void;
    onToggle: (row: MediaRow, index: number, shiftKey: boolean) => void;
    reloading: boolean;
    rows: MediaRow[];
};
/**
 * Download and copy sit beside the card's own button rather than inside it —
 * a button may not nest interactive content.
 */
export declare function RowQuickActions({ row }: {
    row: MediaRow;
}): ReactNode;
export declare function MediaGrid({ activeId, isSelected, onActivate, onToggle, reloading, rows, }: RowListProps): import("react").JSX.Element;
