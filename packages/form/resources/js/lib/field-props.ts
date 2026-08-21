import type { Node } from "@lattice-php/core";
import type { ComponentPropsMap } from "../generated";

/**
 * The props every form-field node shares (the PHP Field base). Nodes flow through
 * the form framework loosely typed via the generic schema, so this is the typed
 * lens the shared hooks read them through. Everything is optional because the
 * lens is also applied to non-field nodes while walking the schema. Derived from
 * a generated field type (every field bakes the base in) rather than hand-written.
 */
type FieldProps = Partial<
  Pick<
    ComponentPropsMap["field.text-input"],
    | "conditions"
    | "dependsOnAny"
    | "dependsOnKeys"
    | "disabled"
    | "editablePrefill"
    | "helperText"
    | "label"
    | "labelAction"
    | "name"
    | "prefillRefreshOn"
    | "prefillResetOn"
    | "readOnly"
    | "required"
    | "tooltip"
    | "value"
  >
>;

/**
 * Field types whose value is a collection of rows. Schema walkers must not
 * descend into their child schemas as top-level fields; children live under
 * `name.<index>.` paths instead.
 */
export const ROW_FIELD_TYPES = new Set(["field.builder", "field.repeater"]);

/**
 * A field whose value is a collection of rows: the built-in set plus any
 * node shipping typed row templates on the wire (the tree field, custom
 * typed-rows fields from other packages).
 */
export function isRowField(node: Node): boolean {
  return (
    ROW_FIELD_TYPES.has(node.type) ||
    Array.isArray((node.props as { templates?: unknown }).templates)
  );
}

/** The reserved row key rows of this field nest recursively under, if any. */
export function nestedRowsKey(node: Node): string | null {
  const key = (node.props as { nestedRowsKey?: unknown }).nestedRowsKey;

  return typeof key === "string" && key !== "" ? key : null;
}

export function fieldProps(node: Node): FieldProps {
  return node.props as FieldProps;
}

export function walkFields(
  nodes: Node[] | undefined,
  visit: (props: FieldProps, node: Node) => void,
): void {
  for (const child of nodes ?? []) {
    visit(fieldProps(child), child);
    walkFields(child.schema, visit);
  }
}
