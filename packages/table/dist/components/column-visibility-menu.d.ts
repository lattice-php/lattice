import { ToggleableColumn } from '../hooks/use-column-visibility.js';
export declare function ColumnVisibilityMenu({ columns, hasHidden, isVisible, onReset, onToggle, processing, visibleColumnCount, }: {
    columns: ToggleableColumn[];
    hasHidden: boolean;
    isVisible: (column: ToggleableColumn) => boolean;
    onReset: () => void;
    onToggle: (key: string, visible: boolean) => void;
    processing: boolean;
    visibleColumnCount: number;
}): import("react").JSX.Element;
