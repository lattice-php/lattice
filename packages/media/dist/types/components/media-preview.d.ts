import { Node, NodeProps } from '@lattice-php/core/types';
import { MediaRow } from './media-row';
export declare function isViewableDocument(row: MediaRow, viewer: Node | undefined): boolean;
/**
 * The library serializes one document-viewer template; every preview is that
 * node with the selected file's url patched in. Ids stay distinct so the
 * compact preview and the full view never collide.
 */
export declare function documentNode(viewer: Node, row: MediaRow, props?: NodeProps): Node;
/** The square face of a card or list row: the derivative, or the type icon. */
export declare function MediaThumb({ className, row, testId, }: {
    className?: string;
    row: MediaRow;
    testId?: string;
}): import("react").JSX.Element;
/**
 * The large preview in the inspector. Images use the original, not the
 * derivative: one src feeds both this image and the lightbox it opens, and
 * zooming into a cover-cropped thumbnail shows less than the panel already did.
 */
export declare function MediaPreview({ row, viewer }: {
    row: MediaRow;
    viewer?: Node;
}): import("react").JSX.Element;
