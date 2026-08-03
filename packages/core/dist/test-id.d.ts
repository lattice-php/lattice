import { Node } from "./index.js";
type IdentifiedNode = Pick<Node, "id" | "key">;
export declare function testIdentity(value: string | null | undefined): string | undefined;
export declare function nodeIdentity(node: IdentifiedNode): string | undefined;
export declare function leafTestIdentity(value: string | null | undefined): string | undefined;
export declare function prefixedTestId(
  prefix: string,
  value: string | null | undefined,
): string | undefined;
export declare function prefixedNodeTestId(
  prefix: string,
  node: IdentifiedNode,
): string | undefined;

