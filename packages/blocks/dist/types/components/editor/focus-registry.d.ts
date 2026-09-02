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
export declare function useInlineFocus(): InlineFocus;
