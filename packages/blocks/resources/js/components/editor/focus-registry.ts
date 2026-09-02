import { useMemo, useRef } from "react";

export type InlineEdge = "start" | "end";

export type InlineHandle = {
  focus: (edge: InlineEdge) => void;
  /** Take over the content of a block being merged into this one; false when the content does not fit. */
  append?: (content: unknown[]) => boolean;
};

export type InlineFocus = {
  register: (blockId: string, field: string, handle: InlineHandle) => () => void;
  /** Focus the first (start) or last (end) inline editor of a block; false when it has none. */
  focusInline: (blockId: string, edge: InlineEdge) => boolean;
  appendTo: (blockId: string, content: unknown[]) => boolean;
  /** Focus a block's inline editor as soon as it mounts, for blocks that still await their render. */
  requestFocus: (blockId: string, edge: InlineEdge) => void;
  hasInline: (blockId: string) => boolean;
};

/**
 * Inline editors announce themselves per block and field so keyboard
 * navigation can hop between blocks and merges can hand text to a neighbour.
 */
export function useInlineFocus(): InlineFocus {
  const handles = useRef(new Map<string, Map<string, InlineHandle>>());
  const pending = useRef<{ blockId: string; edge: InlineEdge } | null>(null);

  return useMemo<InlineFocus>(() => {
    const fieldsOf = (blockId: string) => Array.from(handles.current.get(blockId)?.values() ?? []);

    const focusInline = (blockId: string, edge: InlineEdge) => {
      const fields = fieldsOf(blockId);
      const handle = edge === "start" ? fields[0] : fields[fields.length - 1];

      if (!handle) {
        return false;
      }

      handle.focus(edge);

      return true;
    };

    return {
      appendTo: (blockId, content) => {
        const fields = fieldsOf(blockId);
        const handle = fields[fields.length - 1];

        return handle?.append?.(content) ?? false;
      },
      focusInline,
      hasInline: (blockId) => fieldsOf(blockId).length > 0,
      register: (blockId, field, handle) => {
        const block = handles.current.get(blockId) ?? new Map<string, InlineHandle>();
        block.set(field, handle);
        handles.current.set(blockId, block);

        if (pending.current?.blockId === blockId) {
          const edge = pending.current.edge;
          pending.current = null;
          queueMicrotask(() => focusInline(blockId, edge));
        }

        return () => {
          const current = handles.current.get(blockId);
          current?.delete(field);

          if (current?.size === 0) {
            handles.current.delete(blockId);
          }
        };
      },
      requestFocus: (blockId, edge) => {
        if (!focusInline(blockId, edge)) {
          pending.current = { blockId, edge };
        }
      },
    };
  }, []);
}
