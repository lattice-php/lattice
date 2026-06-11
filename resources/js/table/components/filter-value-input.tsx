import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { FilterType } from "@lattice/lattice/types/generated";

const baseClass =
  "h-9 w-full rounded-lt-sm border border-lt-input bg-lt-bg px-2 text-sm font-normal";

export function FilterValueInput({
  type,
  label,
  value,
  processing,
  withSearchIcon = false,
  ariaLabel,
  onCommit,
  onClear,
}: {
  type: FilterType;
  label: string;
  value: string;
  processing: boolean;
  withSearchIcon?: boolean;
  ariaLabel?: string;
  onCommit: (value: string) => void;
  onClear?: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const inputLabel = ariaLabel ?? `Filter ${label}`;

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (type === "boolean") {
    return (
      <select
        aria-label={inputLabel}
        className={baseClass}
        disabled={processing}
        value={value}
        onChange={(event) => onCommit(event.target.value)}
      >
        <option value="">All</option>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    );
  }

  if (type === "date") {
    return (
      <input
        type="date"
        aria-label={inputLabel}
        className={baseClass}
        disabled={processing}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          onCommit(event.target.value);
        }}
      />
    );
  }

  return (
    <div className="relative flex items-center">
      {withSearchIcon && (
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-2 size-4 text-lt-muted-fg"
        />
      )}
      <input
        type={type === "number" ? "number" : "text"}
        aria-label={inputLabel}
        className={`${baseClass} ${withSearchIcon ? "pl-8" : ""} ${onClear ? "pr-8" : ""}`}
        disabled={processing}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onCommit(draft);
          }
        }}
        onBlur={() => {
          if (draft !== value) {
            onCommit(draft);
          }
        }}
      />
      {onClear && draft !== "" && (
        <button
          type="button"
          aria-label={`Clear ${label} filter`}
          className="absolute right-1 inline-flex size-6 items-center justify-center rounded hover:bg-lt-muted disabled:opacity-50"
          disabled={processing}
          onClick={onClear}
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      )}
    </div>
  );
}
