import { HTMLAttributes } from 'react';
import { SizableColumn } from './column-sizing.js';
type ResizeHandleProps = HTMLAttributes<HTMLDivElement> & {
    "aria-label": string;
    "aria-orientation": "vertical";
    "aria-valuemax": number;
    "aria-valuemin": number;
    "aria-valuenow": number;
    role: "separator";
    tabIndex: number;
};
export declare function useColumnResizing({ columnGapPx, columns, enabled, leadingTracks, showIndicator, storageKey, trailingTracks, }: {
    columnGapPx?: number;
    columns: SizableColumn[];
    enabled: boolean;
    leadingTracks?: string[];
    showIndicator?: boolean;
    storageKey?: string;
    trailingTracks?: string[];
}): {
    getResizeHandleProps: (column: SizableColumn) => ResizeHandleProps;
    gridTemplateColumns: string;
    hasOverrides: boolean;
    resizeRootRef: import('react').RefObject<HTMLDivElement | null>;
    resetColumns: () => void;
    resetColumnWidth: (column: SizableColumn) => void;
};
export {};
