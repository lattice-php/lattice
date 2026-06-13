import type { Node } from "./types";

type IdentifiedNode = Pick<Node, "id" | "key">;

export function testIdentity(value: string | null | undefined): string | undefined {
  return value === undefined || value === null || value === "" ? undefined : value;
}

export function nodeIdentity(node: IdentifiedNode): string | undefined {
  return testIdentity(node.key) ?? testIdentity(node.id);
}

export function leafTestIdentity(value: string | null | undefined): string | undefined {
  return testIdentity(value)?.split(".").at(-1);
}

export function prefixedTestId(
  prefix: string,
  value: string | null | undefined,
): string | undefined {
  const identity = leafTestIdentity(value);

  return identity ? `${prefix}-${identity}` : undefined;
}

export function nodeTestId(node: IdentifiedNode): string | undefined {
  return nodeIdentity(node);
}

export function prefixedNodeTestId(prefix: string, node: IdentifiedNode): string | undefined {
  return prefixedTestId(prefix, nodeIdentity(node));
}

export function fieldTestId(name: string | null | undefined): string | undefined {
  return testIdentity(name);
}
