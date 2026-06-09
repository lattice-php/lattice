import { X } from "lucide-react";
import { flattenColumns } from "../payload";
import { operatorLabel } from "../query";
import type { FilterClause, TableColumn } from "../types";

export function FilterStackBar({
  filters,
  columns,
  processing,
  onRemove,
}: {
  filters: FilterClause[];
  columns: TableColumn[];
  processing: boolean;
  onRemove: (index: number) => void;
}) {
  const labels = new Map(flattenColumns(columns).map((column) => [column.key, column.label]));

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-lt-border px-4 py-2.5 text-sm">
      {filters.map((clause, index) => {
        const label = labels.get(clause.field) ?? clause.field;

        return (
          <span
            key={`${clause.field}-${clause.operator}-${index}`}
            className="inline-flex items-center gap-1.5"
          >
            <span>
              {`${label} ${operatorLabel(clause.operator)}: `}
              <span className="font-semibold">{clause.value}</span>
            </span>
            <button
              type="button"
              className="inline-flex size-5 items-center justify-center rounded text-lt-muted-fg hover:bg-lt-muted disabled:opacity-50"
              disabled={processing}
              aria-label={`Remove ${label} filter`}
              onClick={() => onRemove(index)}
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
