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
    <div className="flex flex-wrap items-center gap-2 border-b border-lt-border px-4 py-3 text-sm">
      <span className="font-medium text-lt-muted-fg">Filters</span>
      {filters.map((clause, index) => {
        const label = labels.get(clause.field) ?? clause.field;

        return (
          <span
            key={`${clause.field}-${clause.operator}-${index}`}
            className="inline-flex items-center gap-1.5 rounded-lt-sm border border-lt-border bg-lt-bg px-2 py-1"
          >
            <span>{`${label} ${operatorLabel(clause.operator)} ${clause.value}`}</span>
            <button
              type="button"
              className="inline-flex size-5 items-center justify-center rounded hover:bg-lt-muted disabled:opacity-50"
              disabled={processing}
              aria-label={`Remove ${label} filter`}
              onClick={() => onRemove(index)}
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
