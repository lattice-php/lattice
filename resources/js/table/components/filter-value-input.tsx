import { Icon } from "@lattice-php/lattice/icons";
import { useEffect, useState } from "react";
import { useT } from "@lattice-php/lattice/i18n";
import type { FilterType } from "@lattice-php/lattice/types/generated";

const baseClass =
  "h-9 w-full min-w-0 rounded-lt-sm border border-lt-input bg-lt-bg px-2 text-sm font-normal";

export function FilterValueInput({
  type,
  label,
  value,
  processing,
  withSearchIcon = false,
  grouped = false,
  ariaLabel,
  testId,
  onCommit,
  onClear,
}: {
  type: FilterType;
  label: string;
  value: string;
  processing: boolean;
  withSearchIcon?: boolean;
  grouped?: boolean;
  ariaLabel?: string;
  testId?: string;
  onCommit: (value: string) => void;
  onClear?: () => void;
}) {
  const { t } = useT("lattice");
  const [draft, setDraft] = useState(value);
  const inputLabel = ariaLabel ?? t("filter.filterBy", "Filter {{label}}", { label });
  const groupedClass = grouped ? "rounded-r-none" : "";

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (type === "boolean") {
    return (
      <select
        aria-label={inputLabel}
        data-test={testId}
        className={`${baseClass} ${groupedClass}`}
        disabled={processing}
        value={value}
        onChange={(event) => onCommit(event.target.value)}
      >
        <option value="">{t("filter.all", "All")}</option>
        <option value="true">{t("filter.true", "True")}</option>
        <option value="false">{t("filter.false", "False")}</option>
      </select>
    );
  }

  if (type === "date") {
    return (
      <input
        type="date"
        aria-label={inputLabel}
        data-test={testId}
        className={`${baseClass} ${groupedClass}`}
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
    <div className="relative flex w-full min-w-0 items-center">
      {withSearchIcon && (
        <Icon
          name="search"
          aria-hidden="true"
          className="pointer-events-none absolute left-2 size-lt-icon-md text-lt-muted-fg"
        />
      )}
      <input
        type={type === "number" ? "number" : "text"}
        aria-label={inputLabel}
        data-test={testId}
        className={`${baseClass} ${groupedClass} ${withSearchIcon ? "pl-8" : ""} ${onClear ? "pr-8" : ""}`}
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
          aria-label={t("filter.clear", "Clear {{label}} filter", { label })}
          data-test={testId ? `${testId}-clear` : undefined}
          className="absolute right-1 inline-flex size-6 items-center justify-center rounded hover:bg-lt-muted disabled:opacity-50"
          disabled={processing}
          onClick={onClear}
        >
          <Icon name="x" aria-hidden="true" className="size-lt-icon-sm" />
        </button>
      )}
    </div>
  );
}
