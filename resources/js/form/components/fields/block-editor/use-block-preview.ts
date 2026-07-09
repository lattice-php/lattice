import { useCallback, useState } from "react";
import { apiJson } from "@lattice-php/lattice/core/api";
import type { Node } from "@lattice-php/lattice/core/types";

type Options = {
  endpoint: string;
  ref: string;
  initial: Record<string, Node[]>;
};

export function useBlockPreview({ endpoint, ref, initial }: Options): {
  wireFor: (rowId: string) => Node[];
  refresh: (rowId: string, type: string, attributes: Record<string, unknown>) => Promise<void>;
} {
  const [wire, setWire] = useState<Record<string, Node[]>>(initial);

  const wireFor = useCallback((rowId: string): Node[] => wire[rowId] ?? [], [wire]);

  const refresh = useCallback(
    async (rowId: string, type: string, attributes: Record<string, unknown>): Promise<void> => {
      try {
        const { wire: next } = await apiJson<{ wire: Node[] }>(endpoint, {
          method: "POST",
          ref,
          body: JSON.stringify({ type, attributes }),
        });

        setWire((prev) => ({ ...prev, [rowId]: next }));
      } catch {
        // keep the last-good wire on failure
      }
    },
    [endpoint, ref],
  );

  return { wireFor, refresh };
}
