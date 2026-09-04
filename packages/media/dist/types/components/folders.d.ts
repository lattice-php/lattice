import { Node } from '@lattice-php/core/types';
/** The rail's own filter state for media that belongs to no folder. */
export declare const UNASSIGNED_FOLDER = "unassigned";
export type FolderOption = {
    id: string;
    label: string;
};
/**
 * The composed tree flattened into indented options: the inspector's folder
 * select reads the folders the rail already received instead of asking the
 * server again.
 */
export declare function folderOptions(tree: Node | undefined, depth?: number): FolderOption[];
