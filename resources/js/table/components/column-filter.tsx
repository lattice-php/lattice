import { X } from "lucide-react";
import type { TableColumn } from "../types";

const controlClass =
  "h-8 w-full rounded-lt-sm border border-lt-input bg-lt-bg px-2 text-xs font-normal data-[active=true]:border-lt-primary";

function ClearButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Clear ${label} filter`}
      className="inline-flex size-6 shrink-0 items-center justify-center rounded hover:bg-lt-muted disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
    >
      <X aria-hidden="true" className="size-3" />
    </button>
  );
}

export function ColumnFilter({
  column,
  value,
  processing,
  onChange,
  onApply,
}: {
  column: TableColumn;
  value: string;
  processing: boolean;
  onChange: (value: string) => void;
  onApply: (value: string) => void;
}) {
  const type = column.filter?.type ?? "partial";
  const active = value !== "";

  if (type === "boolean") {
    return (
      <select
        aria-label={`Filter ${column.label}`}
        className={controlClass}
        data-active={active}
        disabled={processing}
        value={value}
        onChange={(event) => onApply(event.target.value)}
      >
        <option value="">All</option>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    );
  }

  if (type === "date") {
    return (
      <div className="flex items-center gap-1">
        <input
          type="date"
          aria-label={`Filter ${column.label}`}
          className={controlClass}
          data-active={active}
          disabled={processing}
          value={value}
          onChange={(event) => onApply(event.target.value)}
        />
        {active && (
          <ClearButton label={column.label} disabled={processing} onClick={() => onApply("")} />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        aria-label={`Filter ${column.label}`}
        className={controlClass}
        data-active={active}
        disabled={processing}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onApply(value);
          }
        }}
      />
      {active && (
        <ClearButton label={column.label} disabled={processing} onClick={() => onApply("")} />
      )}
    </div>
  );
}
