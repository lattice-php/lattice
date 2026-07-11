import { useCallback, useRef, useState } from "react";
import { apiJson } from "@lattice-php/lattice/core/api";
import type { Node } from "@lattice-php/lattice/core/types";

export type BlockSource = { type: string; attributes: Record<string, unknown> };

/** The server-rendered preview for one block row, mirroring the value's slot nesting. */
export type RenderedBlock = { wire: Node[]; slots?: Record<string, RenderedBlock[]> };

type Options = {
  endpoint: string;
  ref: string;
  initial: Record<string, Node[]>;
  renderedWith: Record<string, BlockSource>;
};

export function useBlockPreview({ endpoint, ref, initial, renderedWith }: Options): {
  wireFor: (rowId: string) => Node[];
  refresh: (rowId: string, type: string, attributes: Record<string, unknown>) => Promise<void>;
} {
  const [wire, setWire] = useState<Record<string, Node[]>>(initial);

  const lastRendered = useRef<Record<string, string> | null>(null);
  lastRendered.current ??= Object.fromEntries(
    Object.entries(renderedWith).map(([rowId, source]) => [rowId, JSON.stringify(source)]),
  );

  const wireFor = useCallback((rowId: string): Node[] => wire[rowId] ?? [], [wire]);

  const refresh = useCallback(
    async (rowId: string, type: string, attributes: Record<string, unknown>): Promise<void> => {
      const rendered = (lastRendered.current ??= {});
      const source = JSON.stringify({ type, attributes } satisfies BlockSource);

      if (rendered[rowId] === source) {
        return;
      }

      try {
        const { wire: next } = await apiJson<{ wire: Node[] }>(endpoint, {
          method: "POST",
          ref,
          body: JSON.stringify({ type, attributes }),
        });

        rendered[rowId] = source;
        setWire((prev) => ({ ...prev, [rowId]: next }));
      } catch {
        // keep the last-good wire on failure; the next commit retries
      }
    },
    [endpoint, ref],
  );

  return { wireFor, refresh };
}
