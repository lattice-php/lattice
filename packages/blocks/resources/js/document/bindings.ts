import type { Node } from "@lattice-php/core";

export type BindingKind = "text" | "rich" | "media" | "field";

export type BoundField = {
  name: string;
  kind: BindingKind;
  multiline: boolean;
  placeholder: string | null;
  node: Node;
};

const TEXT_FIELD_TYPES = new Set(["field.text-input", "field.textarea"]);

function fieldName(node: Node): string | null {
  const name = (node.props as { name?: unknown }).name;

  return typeof name === "string" ? name : null;
}

/**
 * Locate a field in a block type's inspector schema. Fields may sit inside
 * layout containers (grids, stacks), so the search descends into `schema`.
 */
export function findFieldNode(schema: readonly Node[], name: string): Node | null {
  for (const node of schema) {
    if (node.type.startsWith("field.") && fieldName(node) === name) {
      return node;
    }

    const nested = node.schema ? findFieldNode(node.schema, name) : null;

    if (nested) {
      return nested;
    }
  }

  return null;
}

export function boundFieldFor(schema: readonly Node[], name: string): BoundField | null {
  const node = findFieldNode(schema, name);

  if (!node) {
    return null;
  }

  const placeholder = (node.props as { placeholder?: unknown }).placeholder;

  return {
    kind: TEXT_FIELD_TYPES.has(node.type)
      ? "text"
      : node.type === "field.rich-editor"
        ? "rich"
        : node.type === "field.media-picker"
          ? "media"
          : "field",
    multiline: node.type === "field.textarea",
    name,
    node,
    placeholder: typeof placeholder === "string" ? placeholder : null,
  };
}

function bindingOf(node: Node): string | null {
  const binding = (node.props as { binding?: unknown }).binding;

  return typeof binding === "string" ? binding : null;
}

/** Every field the rendered tree edits inline, in document order. */
export function boundFields(node: Node): string[] {
  const names: string[] = [];

  const visit = (candidate: Node) => {
    const binding = bindingOf(candidate);

    if (binding !== null && !names.includes(binding)) {
      names.push(binding);
    }

    if (candidate.type !== "blocks.slot") {
      candidate.schema?.forEach(visit);
    }
  };

  visit(node);

  return names;
}

/**
 * The inspector schema without the fields that are edited inline. Containers
 * left empty by the filter disappear with their fields.
 */
export function unboundSchema(schema: readonly Node[], bound: readonly string[]): Node[] {
  const result: Node[] = [];

  for (const node of schema) {
    if (node.type.startsWith("field.")) {
      const name = fieldName(node);

      if (name === null || !bound.includes(name)) {
        result.push(node);
      }

      continue;
    }

    if (!node.schema) {
      result.push(node);

      continue;
    }

    const children = unboundSchema(node.schema, bound);

    if (children.length > 0 || node.schema.length === 0) {
      result.push(children === node.schema ? node : { ...node, schema: children });
    }
  }

  return result;
}

/** Replace the props of every node bound to `field`; the tree is otherwise shared. */
export function patchBinding(
  node: Node,
  field: string,
  patch: (props: Node["props"], node: Node) => Node["props"],
): Node {
  if (node.type === "blocks.slot") {
    return node;
  }

  let next = node;

  if (bindingOf(node) === field) {
    next = { ...node, props: patch(node.props, node) };
  }

  if (!node.schema) {
    return next;
  }

  let changed = false;
  const schema = node.schema.map((child) => {
    const patched = patchBinding(child, field, patch);
    changed ||= patched !== child;

    return patched;
  });

  return changed ? { ...next, schema } : next;
}

/**
 * The prop a plain-text edit lands in, by node type: headings and texts show
 * `text`, buttons show `label`. Other node types cannot take a local text patch.
 */
export function textPropFor(nodeType: string): "text" | "label" | null {
  switch (nodeType) {
    case "heading":
    case "text":
      return "text";
    case "button":
      return "label";
    default:
      return null;
  }
}

export function patchText(node: Node, field: string, value: string): Node {
  return patchBinding(node, field, (props, target) => {
    const prop = textPropFor(target.type);

    return prop === null ? props : { ...props, [prop]: value };
  });
}

export function patchDocument(
  node: Node,
  field: string,
  document: Record<string, unknown> | null,
): Node {
  return patchBinding(node, field, (props) => ({ ...props, document }));
}
