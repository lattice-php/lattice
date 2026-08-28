import { Node } from "@lattice-php/core/types";
export type MediaRow = {
  id: number;
  url: string | null;
  /** The library conversion when it was generated, the original otherwise. */
  preview_url: string | null;
  name: string;
  mime_type: string;
  size: number;
  alt: string | null;
  created_at: string;
  attachments_count: number;
};
export type PickMode = {
  multiple: boolean;
  max?: number;
  onConfirm: (items: MediaRow[]) => void;
};
/**
 * The grid face of the media table: it drives the same `useTable` state the
 * core table component does, so search, filters, infinite paging and the
 * `reload-component` effect all behave identically — only the presentation and
 * the selection affordances differ.
 */
export declare function LibraryView({
  node,
  pick,
}: {
  node: Node;
  pick?: PickMode;
}): import("react").JSX.Element;
