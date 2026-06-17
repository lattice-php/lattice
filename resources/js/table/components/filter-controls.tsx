import { Icon } from "@lattice-php/lattice/icons";
import { useState } from "react";
import { Checkbox } from "@lattice-php/lattice/core/components/checkbox";
import { Combobox } from "@lattice-php/lattice/core/components/combobox";
import { useT } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { FilterData, Option } from "@lattice-php/lattice/types/generated";
import { filterOptions, stringProp } from "../filter-values";
import { fieldClass } from "./filter-value-input";

export type DateRangeValue = { from?: string; until?: string };

export type FilterOptionSearch = (query: string) => Promise<Option[]>;

/**
 * Renders the control for a single dedicated table filter, dispatching on the
 * filter's `type`. The current value comes from the table state; `onChange`
 * pushes a new value (an empty value clears the filter).
 */
export function TableFilterControl({
  filter,
  value,
  processing,
  onChange,
  onSearch,
}: {
  filter: FilterData;
  value: unknown;
  processing: boolean;
  onChange: (value: unknown) => void;
  onSearch?: FilterOptionSearch;
}) {
  switch (filter.type) {
    case "select":
      if (filter.props.searchable === true && onSearch) {
        return (
          <SearchableSelectControl
            filter={filter}
            value={value}
            processing={processing}
            onChange={onChange}
            onSearch={onSearch}
          />
        );
      }

      return filter.props.multiple === true ? (
        <MultiSelectControl
          filter={filter}
          value={value}
          processing={processing}
          onChange={onChange}
        />
      ) : (
        <SelectControl filter={filter} value={value} processing={processing} onChange={onChange} />
      );
    case "ternary":
      return (
        <TernaryControl filter={filter} value={value} processing={processing} onChange={onChange} />
      );
    case "date-range":
      return (
        <DateRangeControl
          filter={filter}
          value={value}
          processing={processing}
          onChange={onChange}
        />
      );
    case "toggle":
      return (
        <ToggleControl filter={filter} value={value} processing={processing} onChange={onChange} />
      );
    default:
      return null;
  }
}

function SelectControl({
  filter,
  value,
  processing,
  onChange,
}: {
  filter: FilterData;
  value: unknown;
  processing: boolean;
  onChange: (value: unknown) => void;
}) {
  const { t } = useT("lattice");
  const placeholder = stringProp(filter, "placeholder", t("filter.all", "All"));

  return (
    <select
      aria-label={filter.label}
      data-test={`table-filter-${filter.key}`}
      className={fieldClass}
      disabled={processing}
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{placeholder}</option>
      {filterOptions(filter).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function MultiSelectControl({
  filter,
  value,
  processing,
  onChange,
}: {
  filter: FilterData;
  value: unknown;
  processing: boolean;
  onChange: (value: unknown) => void;
}) {
  const { t } = useT("lattice");
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? (value as string[]) : [];

  function toggle(optionValue: string): void {
    const next = selected.includes(optionValue)
      ? selected.filter((item) => item !== optionValue)
      : [...selected, optionValue];

    onChange(next);
  }

  const summary =
    selected.length === 0
      ? stringProp(filter, "placeholder", t("filter.all", "All"))
      : t("filter.selectedCount", "{{amount}} selected", { amount: selected.length });

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={filter.label}
        aria-expanded={open}
        data-test={`table-filter-${filter.key}`}
        className={`${fieldClass} flex items-center justify-between gap-2`}
        disabled={processing}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{summary}</span>
        <Icon name="chevron-down" aria-hidden="true" className="size-lt-icon-sm shrink-0" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 min-w-full rounded-lt-sm border border-lt-border bg-lt-bg p-1 shadow-lt-md">
          {filterOptions(filter).map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-lt-sm px-2 py-1.5 text-sm hover:bg-lt-muted"
            >
              <Checkbox
                aria-label={option.label}
                data-test={`table-filter-${filter.key}-${option.value}`}
                checked={selected.includes(option.value)}
                disabled={processing}
                onCheckedChange={() => toggle(option.value)}
              />
              <span className="truncate">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchableSelectControl({
  filter,
  value,
  processing,
  onChange,
  onSearch,
}: {
  filter: FilterData;
  value: unknown;
  processing: boolean;
  onChange: (value: unknown) => void;
  onSearch: FilterOptionSearch;
}) {
  const { t } = useT("lattice");
  const multiple = filter.props.multiple === true;
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Option[]>(() => filterOptions(filter));
  const [loading, setLoading] = useState(false);

  const selected = multiple
    ? Array.isArray(value)
      ? (value as string[])
      : []
    : typeof value === "string" && value !== ""
      ? [value]
      : [];

  const labels = new Map(
    [...filterOptions(filter), ...results].map((option) => [option.value, option.label]),
  );
  const summary =
    selected.length === 0
      ? stringProp(filter, "placeholder", t("filter.all", "All"))
      : multiple
        ? t("filter.selectedCount", "{{amount}} selected", { amount: selected.length })
        : (labels.get(selected[0]) ?? selected[0]);

  function search(query: string): void {
    setLoading(true);
    void onSearch(query).then((options) => {
      setResults(options);
      setLoading(false);
    });
  }

  function choose(optionValue: string): void {
    onChange(
      multiple
        ? selected.includes(optionValue)
          ? selected.filter((item) => item !== optionValue)
          : [...selected, optionValue]
        : optionValue,
    );
  }

  return (
    <Combobox
      contentClassName="w-60"
      loading={loading}
      multiple={multiple}
      onSearch={search}
      onSelect={choose}
      open={open}
      onOpenChange={setOpen}
      options={results}
      searchLabel={t("filter.search", "Search")}
      selected={selected}
      testId={`table-filter-${filter.key}`}
      trigger={
        <>
          <span className="truncate">{summary}</span>
          <Icon name="chevron-down" aria-hidden="true" className="size-lt-icon-sm shrink-0" />
        </>
      }
      triggerClassName={cn(fieldClass, "flex items-center justify-between gap-2")}
      triggerProps={{
        "aria-label": filter.label,
        "data-test": `table-filter-${filter.key}`,
        disabled: processing,
      }}
    />
  );
}

function TernaryControl({
  filter,
  value,
  processing,
  onChange,
}: {
  filter: FilterData;
  value: unknown;
  processing: boolean;
  onChange: (value: unknown) => void;
}) {
  const { t } = useT("lattice");
  const placeholder = stringProp(filter, "placeholder", t("filter.all", "All"));
  const trueLabel = stringProp(filter, "trueLabel", t("filter.true", "True"));
  const falseLabel = stringProp(filter, "falseLabel", t("filter.false", "False"));

  return (
    <select
      aria-label={filter.label}
      data-test={`table-filter-${filter.key}`}
      className={fieldClass}
      disabled={processing}
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{placeholder}</option>
      <option value="true">{trueLabel}</option>
      <option value="false">{falseLabel}</option>
    </select>
  );
}

function DateRangeControl({
  filter,
  value,
  processing,
  onChange,
}: {
  filter: FilterData;
  value: unknown;
  processing: boolean;
  onChange: (value: unknown) => void;
}) {
  const { t } = useT("lattice");
  const range: DateRangeValue = value && typeof value === "object" ? (value as DateRangeValue) : {};

  function commit(next: DateRangeValue): void {
    onChange({ from: next.from ?? "", until: next.until ?? "" });
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="date"
        aria-label={t("filter.from", "{{label}} from", { label: filter.label })}
        data-test={`table-filter-${filter.key}-from`}
        className={fieldClass}
        disabled={processing}
        value={range.from ?? ""}
        onChange={(event) => commit({ ...range, from: event.target.value })}
      />
      <span className="text-lt-muted-fg" aria-hidden="true">
        –
      </span>
      <input
        type="date"
        aria-label={t("filter.until", "{{label}} until", { label: filter.label })}
        data-test={`table-filter-${filter.key}-until`}
        className={fieldClass}
        disabled={processing}
        value={range.until ?? ""}
        onChange={(event) => commit({ ...range, until: event.target.value })}
      />
    </div>
  );
}

function ToggleControl({
  filter,
  value,
  processing,
  onChange,
}: {
  filter: FilterData;
  value: unknown;
  processing: boolean;
  onChange: (value: unknown) => void;
}) {
  const checked = value === "1" || value === true || value === "true";

  return (
    <label className="flex h-9 cursor-pointer items-center gap-2 text-sm">
      <Checkbox
        aria-label={filter.label}
        data-test={`table-filter-${filter.key}`}
        checked={checked}
        disabled={processing}
        onCheckedChange={(next) => onChange(next === true ? "1" : "")}
      />
      <span>{filter.label}</span>
    </label>
  );
}
