import { Node } from '@lattice-php/core/types';
/**
 * The folder navigation beside the grid. Real folders come from the tree node
 * the library composed — lazy loading, keyboard navigation, drag-and-drop and
 * the per-folder actions are the tree package's, not ours. "All files" and
 * "Without folder" are ours: they are filter states, not folders.
 */
export declare function FolderRail({ activeFolder, create, onSelect, tree, }: {
    activeFolder: string;
    create?: Node<"action">;
    onSelect: (folder: string) => void;
    tree: Node;
}): import("react").JSX.Element;
