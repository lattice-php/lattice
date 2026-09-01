import {
  attachTreeItemInstruction,
  dropTargetForElements,
  extractTreeItemInstruction,
} from "@lattice-php/lattice/dnd";
import type { TreeItemInstruction, TreeItemMode } from "@lattice-php/lattice/dnd";

export type TreeDragSource = { id: string; label: string };

/** The drag payload contract shared by every tree-item drag source. */
export function treeItemDragData(
  dragType: string,
  source: TreeDragSource,
): Record<string, unknown> {
  return { label: source.label, sourceId: source.id, type: dragType };
}

function dragSourceOf(
  dragType: string,
  data: Record<string | symbol, unknown>,
): TreeDragSource | null {
  if (data.type !== dragType || typeof data.sourceId !== "string") {
    return null;
  }

  return { id: data.sourceId, label: typeof data.label === "string" ? data.label : data.sourceId };
}

/**
 * The shared tree-item drop target: the instruction hitbox, blocked-instruction
 * computation, and the drop-instruction bookkeeping around it. Consumers own
 * what a drop means — an action call for the display tree, a form-state update
 * for the tree field — via onDrop, which never fires for blocked instructions.
 */
export function treeItemDropTarget(options: {
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
}): () => void {
  const { dragType, onInstruction } = options;

  return dropTargetForElements({
    element: options.element,
    canDrop: ({ source }) => {
      const dragSource = dragSourceOf(dragType, source.data);

      return dragSource !== null && options.canDrop(dragSource);
    },
    getData: ({ element: target, input, source }) => {
      const dragSource = dragSourceOf(dragType, source.data);

      return attachTreeItemInstruction(
        { type: dragType },
        {
          block: dragSource ? options.blockedInstructions(dragSource) : [],
          currentLevel: options.currentLevel,
          element: target,
          indentPerLevel: options.indentPerLevel ?? 24,
          input,
          mode: options.mode,
        },
      );
    },
    onDrag: ({ self }) => onInstruction(extractTreeItemInstruction(self.data)?.type ?? null),
    onDragEnter: ({ self }) => {
      onInstruction(extractTreeItemInstruction(self.data)?.type ?? null);
      options.onEnter?.();
    },
    onDragLeave: () => {
      options.onLeave?.();
      onInstruction(null);
    },
    onDrop: ({ self, source }) => {
      options.onLeave?.();
      onInstruction(null);

      const dragSource = dragSourceOf(dragType, source.data);
      const instruction = extractTreeItemInstruction(self.data);

      if (!dragSource || !instruction || instruction.type === "instruction-blocked") {
        return;
      }

      options.onDrop(dragSource, instruction);
    },
  });
}

export function dropIndicatorClass(instruction: TreeItemInstruction["type"] | null): string | null {
  switch (instruction) {
    case "reorder-above":
      return "relative before:absolute before:inset-x-0 before:-top-px before:h-0.5 before:bg-lt-primary";
    case "reorder-below":
      return "relative after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-lt-primary";
    case "make-child":
    case "reparent":
      return "bg-lt-primary/10";
    case "instruction-blocked":
      return "bg-lt-danger/10";
    default:
      return null;
  }
}
