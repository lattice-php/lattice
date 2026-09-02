import { useMemo } from "react";
import type { Node } from "@lattice-php/core";
import { boundFieldFor, type BoundField } from "../document/bindings";
import { findBlock } from "../document/tree";
import { useOptionalBlock, type BlockContextValue } from "../components/editor/block-context";
import { useBlockType, useEditorState } from "../components/editor/editor-context";

export type BlockBinding = {
  block: BlockContextValue;
  field: BoundField;
  value: unknown;
};

/**
 * Resolve the field a rendered node is bound to, for nodes inside a block on
 * the editor canvas. Null when the node is unbound, sits outside a block, or
 * names a field the block type does not declare.
 */
export function useBlockBinding(node: Node): BlockBinding | null {
  const block = useOptionalBlock();
  const binding = (node.props as { binding?: unknown }).binding;
  const name = typeof binding === "string" ? binding : null;
  const type = useBlockType(block?.type ?? "");
  const field = useMemo(
    () => (type && name !== null ? boundFieldFor(type.schema, name) : null),
    [name, type],
  );
  const value = useEditorState((state) =>
    block && name !== null ? findBlock(state.document, block.id)?.node.data[name] : undefined,
  );

  if (!block || !field) {
    return null;
  }

  return { block, field, value };
}
