import { Node } from '@lattice-php/core/types';
import { MediaRow } from './library-view';
/**
 * The slideout behind a card click: preview, metadata, and the two per-file
 * actions. Both requests carry `media_id`, so one runner covers them.
 */
export declare function DetailPanel({ row, update, remove, onClose, }: {
    row: MediaRow;
    update: Node<"action">;
    remove: Node<"action">;
    onClose: () => void;
}): import("react").JSX.Element;
