import type { Node } from "@lattice-php/core/types";

/** The rail's own filter state for media that belongs to no folder. */
export const UNASSIGNED_FOLDER = "unassigned";

export type FolderOption = { id: string; label: string };

type FolderNode = { children?: FolderNode[]; id: string; label: string };

/**
 * The composed tree flattened into indented options: the inspector's folder
 * select reads the folders the rail already received instead of asking the
 * server again.
 */
export function folderOptions(tree: Node | undefined, depth = 0): FolderOption[] {
  const nodes = (tree?.props?.nodes ?? []) as FolderNode[];

  return nodes.flatMap((node) => [
    { id: String(node.id), label: `${"— ".repeat(depth)}${node.label}` },
    ...folderOptions({ props: { nodes: node.children ?? [] }, type: "tree" }, depth + 1),
  ]);
}
