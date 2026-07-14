import { useCallback, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Checkbox } from "@lattice-php/lattice/ui/checkbox";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import type { Node, Option } from "@lattice-php/lattice/core/types";
import {
  FieldCommitOverrideProvider,
  FormProvider,
  FormValuesProvider,
  getPath,
  PrefillProvider,
  ResolvedNodesProvider,
  setPath,
  TableCellProvider,
  useFormValues,
  useSetFormValue,
} from "@lattice-php/lattice/form/embed";
import { Icon } from "@lattice-php/lattice/icons";
import { useT } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";
import { filterValue, isActiveFilterValue } from "@lattice-php/lattice/table/lib/filter-values";
import type { FilterNode } from "@lattice-php/lattice/table/types";

export type FilterOptionSearch = (
  field: string,
  query: string,
  signal: AbortSignal,
) => Promise<Option[]>;

type FilterValue = Record<string, unknown>;

export function TableFilterControl({
  filter,
  value,
  processing,
  bare = false,
  onChange,
  onSearch,
}: {
  filter: FilterNode;
  value: unknown;
  processing: boolean;
  bare?: boolean;
  onChange: (value: unknown) => void;
  onSearch?: FilterOptionSearch;
}) {
  const { t } = useT("lattice");
  const schema = filter.schema ?? [];

  if (schema.length === 0) {
    return (
      <ToggleControl filter={filter} value={value} processing={processing} onChange={onChange} />
    );
  }

  return (
    <div className="flex items-end gap-2">
      <div className="min-w-0 flex-1">
        <SchemaControl
          filter={filter}
          schema={schema}
          value={value}
          processing={processing}
          bare={bare}
          onChange={onChange}
          onSearch={onSearch}
        />
      </div>
      {isActiveFilterValue(value) && (
        <button
          aria-label={t("table.filter.clear", "Clear {{label}} filter", {
            label: filter.props.label ?? "",
          })}
          className="inline-flex size-lt-control-md shrink-0 items-center justify-center rounded-lt-sm text-lt-muted-fg hover:bg-lt-muted hover:text-lt-fg disabled:opacity-50"
          disabled={processing}
          onClick={() => onChange(undefined)}
          type="button"
        >
          <Icon name="x" aria-hidden="true" className="size-lt-icon-md" />
        </button>
      )}
    </div>
  );
}

function SchemaControl({
  filter,
  schema,
  value,
  processing,
  bare,
  onChange,
  onSearch,
}: {
  filter: FilterNode;
  schema: Node[];
  value: unknown;
  processing: boolean;
  bare: boolean;
  onChange: (value: unknown) => void;
  onSearch?: FilterOptionSearch;
}) {
  const initial = useMemo(() => filterValue(value), [value]);
  const form = useMemo(
    () => ({
      action: "#",
      clearErrors: () => {},
      componentId: `table-filter-${filter.key}`,
      componentRef: "",
      errors: {},
      fieldIdPrefix: `table-filter-${filter.key}`,
      fieldLabels: {},
      precognitive: false,
      processing,
      searchOptions: (
        field: string,
        query: string,
        _values: Record<string, unknown>,
        signal: AbortSignal,
      ) => (onSearch ? onSearch(field, query, signal) : Promise.resolve([])),
      validate: () => {},
    }),
    [filter.key, onSearch, processing],
  );

  const content = (
    <div
      aria-disabled={processing}
      className={cn("grid gap-3", processing && "pointer-events-none opacity-60")}
    >
      <Renderer nodes={schema} />
    </div>
  );

  return (
    <FormProvider value={form}>
      <PrefillProvider value={{ markUserEdit: () => {} }}>
        <ResolvedNodesProvider nodes={{}}>
          <FormValuesProvider initial={initial}>
            <TableFilterCommitBridge onChange={onChange}>
              {bare ? <TableCellProvider>{content}</TableCellProvider> : content}
            </TableFilterCommitBridge>
          </FormValuesProvider>
        </ResolvedNodesProvider>
      </PrefillProvider>
    </FormProvider>
  );
}

function TableFilterCommitBridge({
  children,
  onChange,
}: {
  children: ReactNode;
  onChange: (value: FilterValue) => void;
}) {
  const values = useFormValues();
  const setValue = useSetFormValue();
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const write = useCallback(
    (name: string, value: unknown) => {
      const nextValue =
        typeof value === "function"
          ? (value as (previous: unknown) => unknown)(getPath(valuesRef.current, name))
          : value;
      const next = setPath(valuesRef.current, name, nextValue);

      valuesRef.current = next;
      setValue(name, nextValue);
      onChange(next);
    },
    [onChange, setValue],
  );

  const commit = useMemo(
    () => ({
      blur: () => {},
      change: write,
      commit: write,
    }),
    [write],
  );

  return <FieldCommitOverrideProvider value={commit}>{children}</FieldCommitOverrideProvider>;
}

function ToggleControl({
  filter,
  value,
  processing,
  onChange,
}: {
  filter: FilterNode;
  value: unknown;
  processing: boolean;
  onChange: (value: unknown) => void;
}) {
  const checked = isTruthy(filterValue(value).value);

  return (
    <label className="flex h-lt-control-md cursor-pointer items-center gap-2 text-sm">
      <Checkbox
        aria-label={filter.props.label ?? undefined}
        data-test={`table-filter-${filter.key}`}
        checked={checked}
        disabled={processing}
        onCheckedChange={(next) => onChange(next === true ? { value: "1" } : undefined)}
      />
      <span>{filter.props.label}</span>
    </label>
  );
}

function isTruthy(value: unknown): boolean {
  return value === true || value === "1" || value === 1 || value === "true";
}
