import type { Node } from "@lattice-php/core";
import type { RowTemplateData } from "../../generated";

export function rowTemplatesOf(node: Node): RowTemplateData[] | undefined {
  const templates = (node.props as { templates?: RowTemplateData[] }).templates;
  return templates?.length ? templates : undefined;
}

/** The schema for a submitted row: its matching template, or the node's own schema when untyped. */
export function rowSchemaFor(node: Node, row: Record<string, unknown>): Node[] {
  const templates = rowTemplatesOf(node);

  if (!templates) {
    return node.schema ?? [];
  }

  return templates.find((template) => template.type === row.type)?.schema ?? [];
}
