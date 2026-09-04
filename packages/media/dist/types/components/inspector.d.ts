import { Node } from '@lattice-php/core/types';
import { FolderOption } from './folders';
import { MediaRow } from './media-row';
/**
 * The panel beside the grid: preview, metadata, and the two per-file actions.
 * Both requests carry `media_id`, so one runner covers them.
 */
export declare function Inspector({ folders, onClose, onDeleted, remove, row, update, viewer, }: {
    folders: FolderOption[];
    onClose: () => void;
    onDeleted: () => void;
    remove: Node<"action">;
    row: MediaRow;
    update: Node<"action">;
    viewer?: Node;
}): import("react").JSX.Element;
/** What the panel shows while a multi-selection is active. */
export declare function SelectionSummary({ rows }: {
    rows: MediaRow[];
}): import("react").JSX.Element;
