import type { Node } from "@lattice-php/lattice/core/types";

/**
 * Keep only the well-formed component nodes from an untyped value, dropping
 * anything that isn't an object carrying a string `type`.
 */
export function toNodes(value: unknown): Node[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (node): node is Node =>
      typeof node === "object" && node !== null && "type" in node && typeof node.type === "string",
  );
}

/**
 * Stable list key for a node: the reconciliation key, then the id, then a
 * type-scoped index fallback so keyless template children never collide.
 */
export function nodeKey(node: Node, index: number): string {
  return node.key ?? node.id ?? `${node.type}-${index}`;
}
