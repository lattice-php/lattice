import { Node } from '@lattice-php/core/types';
import { PickMode } from './media-row';
export type { MediaRow, PickMode } from './media-row';
/**
 * The grid face of the media table: it drives the same `useTable` state the
 * core table component does, so search, filters, infinite paging and the
 * `reload-component` effect all behave identically — only the presentation and
 * the selection affordances differ.
 */
export declare function LibraryView({ node, pick }: {
    node: Node;
    pick?: PickMode;
}): import("react").JSX.Element;
