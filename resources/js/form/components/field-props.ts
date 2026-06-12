import type { Node } from "@lattice/lattice/core/types";
import type { FieldConditions } from "./conditions";

/**
 * The props every form-field node shares (the PHP Field base). Nodes flow through
 * the form framework loosely typed via the generic schema, so this is the typed
 * lens the shared hooks read them through. Everything is optional because the
 * lens is also applied to non-field nodes while walking the schema.
 */
export type FieldProps = {
  conditions?: FieldConditions | null;
  dependsOnAny?: boolean | null;
  dependsOnKeys?: string[] | null;
  disabled?: boolean | null;
  hidden?: boolean | null;
  label?: string | null;
  name?: string;
  readOnly?: boolean | null;
  required?: boolean | null;
  value?: unknown;
};

export function fieldProps(node: Node): FieldProps {
  return node.props as FieldProps;
}

/** The single schema traversal shared by the label/value and dependency-watch collectors. */
export function walkFields(
  nodes: Node[] | undefined,
  visit: (props: FieldProps, node: Node) => void,
): void {
  for (const child of nodes ?? []) {
    visit(fieldProps(child), child);
    walkFields(child.schema, visit);
  }
}
