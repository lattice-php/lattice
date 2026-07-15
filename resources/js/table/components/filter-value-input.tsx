import { Icon } from "@lattice-php/lattice/icons";
import { useEffect, useState } from "react";
import { IconButton } from "@lattice-php/lattice/ui/icon-button";
import { Input } from "@lattice-php/lattice/ui/input";
import { NativeSelect } from "@lattice-php/lattice/ui/native-select";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
import type { FilterType } from "@lattice-php/lattice/types/generated";

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
  const inputLabel = ariaLabel ?? t("table.filter.filter-by", "Filter {{label}}", { label });
  const groupedClass = grouped ? "rounded-r-none" : "";

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (type === "boolean") {
    return (
      <NativeSelect
        density="compact"
        aria-label={inputLabel}
        data-test={testId}
        className={groupedClass}
        disabled={processing}
        value={value}
        onChange={(event) => onCommit(event.target.value)}
      >
        <option value="">{t("table.filter.all", "All")}</option>
        <option value="true">{t("table.filter.true", "True")}</option>
        <option value="false">{t("table.filter.false", "False")}</option>
      </NativeSelect>
    );
  }

  if (type === "date") {
    return (
      <Input
        type="date"
        density="compact"
        aria-label={inputLabel}
        data-test={testId}
        className={groupedClass}
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
      <Input
        type={type === "number" ? "number" : "text"}
        density="compact"
        aria-label={inputLabel}
        data-test={testId}
        className={cn(groupedClass, withSearchIcon && "pl-8", onClear && "pr-8")}
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
        <IconButton
          size="xs"
          icon="x"
          label={t("table.filter.clear", "Clear {{label}} filter", { label })}
          data-test={testId ? `${testId}-clear` : undefined}
          className="absolute right-1 size-6"
          disabled={processing}
          onClick={onClear}
        />
      )}
    </div>
  );
}
