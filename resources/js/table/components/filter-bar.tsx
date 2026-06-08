import type { Dispatch, SetStateAction } from "react";
import type { TableColumn } from "../types";

export function FilterBar({
  columns,
  filters,
  setFilters,
  processing,
  onApply,
}: {
  columns: TableColumn[];
  filters: Record<string, string>;
  setFilters: Dispatch<SetStateAction<Record<string, string>>>;
  processing: boolean;
  onApply: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-lt-border p-4">
      {columns.map((column) => (
        <label key={column.key} className="grid gap-1 text-sm font-medium">
          <span>{`Filter ${column.label}`}</span>
          <input
            aria-label={`Filter ${column.label}`}
            className="h-9 rounded-lt-sm border border-lt-input bg-lt-bg px-3 text-sm font-normal"
            value={filters[column.key] ?? ""}
            onChange={(event) =>
              setFilters((currentFilters) => ({
                ...currentFilters,
                [column.key]: event.target.value,
              }))
            }
          />
        </label>
      ))}
      <button
        type="button"
        className="h-9 rounded-lt-sm border border-lt-border px-3 text-sm font-medium disabled:opacity-50"
        disabled={processing}
        onClick={onApply}
      >
        Apply filters
      </button>
    </div>
  );
}
