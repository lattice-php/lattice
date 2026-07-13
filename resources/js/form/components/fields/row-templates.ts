import type { Node } from "@lattice-php/lattice/core/types";

export type RowTemplateSlot = { name: string; label?: string; blocks?: string[] };

export type RowTemplate = {
  type: string;
  label: string;
  icon?: string;
  description?: string;
  schema: Node[];
  slots?: RowTemplateSlot[];
};

export function rowTemplatesOf(node: Node): RowTemplate[] | undefined {
  return (node as unknown as { templates?: RowTemplate[] }).templates;
}

/** The schema for a submitted row: its matching template, or the node's own schema when untyped. */
export function rowSchemaFor(node: Node, row: Record<string, unknown>): Node[] {
  const templates = rowTemplatesOf(node);

  if (!templates) {
    return node.schema ?? [];
  }

  return templates.find((template) => template.type === row.type)?.schema ?? [];
}
