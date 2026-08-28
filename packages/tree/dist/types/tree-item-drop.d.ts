import { TreeItemInstruction, TreeItemMode } from '@lattice-php/lattice/dnd';
export type TreeDragSource = {
    id: string;
    label: string;
};
/** The drag payload contract shared by every tree-item drag source. */
export declare function treeItemDragData(dragType: string, source: TreeDragSource): Record<string, unknown>;
/**
 * The shared tree-item drop target: the instruction hitbox, blocked-instruction
 * computation, and the drop-instruction bookkeeping around it. Consumers own
 * what a drop means — an action call for the display tree, a form-state update
 * for the tree field — via onDrop, which never fires for blocked instructions.
 */
export declare function treeItemDropTarget(options: {
    element: HTMLElement;
    dragType: string;
    currentLevel: number;
    mode: TreeItemMode;
    indentPerLevel?: number;
    canDrop: (source: TreeDragSource) => boolean;
    blockedInstructions: (source: TreeDragSource) => TreeItemInstruction["type"][];
    onInstruction: (instruction: TreeItemInstruction["type"] | null) => void;
    onEnter?: () => void;
    onLeave?: () => void;
    onDrop: (source: TreeDragSource, instruction: TreeItemInstruction) => void;
}): () => void;
export declare function dropIndicatorClass(instruction: TreeItemInstruction["type"] | null): string | null;
