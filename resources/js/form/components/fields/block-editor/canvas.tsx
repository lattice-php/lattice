import type { Node } from "@lattice-php/lattice/core/types";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { cn } from "@lattice-php/lattice/lib/utils";
import { ROW_ID_KEY, type RepeaterRow } from "../repeater-rows";

type Props = {
  rows: RepeaterRow[];
  wireFor: (rowId: string) => Node[];
  selectedId: string | null;
  onSelect: (rowId: string) => void;
};

export function BlockCanvas({ rows, wireFor, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-2" role="listbox" aria-label="Blocks">
      {rows.map((row) => {
        const id = String(row[ROW_ID_KEY]);

        return (
          <div
            key={id}
            role="option"
            data-test={`block-shell-${id}`}
            aria-selected={selectedId === id}
            onClick={() => onSelect(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                if (e.key === " ") {
                  e.preventDefault();
                }
                onSelect(id);
              }
            }}
            tabIndex={0}
            className={cn(
              "cursor-pointer rounded-lt border p-2",
              selectedId === id
                ? "border-lt-primary ring-1 ring-lt-primary"
                : "border-transparent hover:border-lt-border",
            )}
          >
            <Renderer nodes={wireFor(id)} />
          </div>
        );
      })}
    </div>
  );
}
