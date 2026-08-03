import { Node } from './index.js';
/**
 * Keep only the well-formed component nodes from an untyped value, dropping
 * anything that isn't an object carrying a string `type`.
 */
export declare function toNodes(value: unknown): Node[];
/**
 * Stable list key for a node: the reconciliation key, then the id, then a
 * type-scoped index fallback so keyless template children never collide.
 */
export declare function nodeKey(node: Node, index: number): string;
