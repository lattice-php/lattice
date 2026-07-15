import { Icon } from "@lattice-php/lattice/icons";
import { useCallback, useMemo, useRef, useState } from "react";
import { Combobox } from "@lattice-php/lattice/ui/combobox";
import { controlSurface } from "@lattice-php/lattice/ui/control";
import { coerceColor, colorValue } from "@lattice-php/lattice/lib/color";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { materializeSchema } from "@lattice-php/lattice/core/materialize";
import type { Node, Option, RendererComponent } from "@lattice-php/lattice/core/types";
import { FormFieldFrame } from "@lattice-php/lattice/form/components/base/field";
import { useFormContext } from "@lattice-php/lattice/form/hooks/context";
import { fieldDomName } from "@lattice-php/lattice/form/lib/field-dom-name";
import { postFormAction } from "@lattice-php/lattice/form/lib/form-transport";
import { useResolvedNode } from "@lattice-php/lattice/form/hooks/resolved-nodes";
import { useDependentField } from "@lattice-php/lattice/form/hooks/use-dependent-field";
import { useFieldCommit } from "@lattice-php/lattice/form/hooks/use-field-commit";
import { useFieldScope } from "@lattice-php/lattice/form/hooks/field-scope";
import { useFormValue, useFormValues } from "@lattice-php/lattice/form/hooks/values";

function toValues(stored: unknown, fallback: unknown): string[] {
  const source = stored ?? fallback;

  if (Array.isArray(source)) {
    return source.map(String);
  }

  if (source === undefined || source === null || source === "") {
    return [];
  }

  return [String(source)];
}

export const SelectComponent: RendererComponent<"field.select"> = ({ node }) => {
  const { t } = useT("lattice");
  const props = node.props;
  const { action, componentRef, errors, fieldIdPrefix, searchOptions } = useFormContext();
  const { hidden, required, readOnly, disabled } = useDependentField(node);
  const { change, blur } = useFieldCommit();
  const resolvedNode = useResolvedNode(node);
  const name = props.name;
  const scope = useFieldScope();
  const domName = fieldDomName(scope ? scope.scopedName(name) : name, fieldIdPrefix);
  const errorKey = scope ? scope.errorKey(name) : name;
  const searchKey = scope ? scope.errorKey(name) : name;
  const placeholder = props.placeholder || "Select…";
  const multiple = props.multiple;
  const searchable = props.searchable;
  const creatable = props.creatable;
  const staticOptions = useMemo(
    () => (resolvedNode.props as { options?: Option[] }).options ?? [],
    [resolvedNode.props],
  );
  const optionSchema = (resolvedNode.props as { optionSchema?: Node[] }).optionSchema;

  const globalValue = useFormValue(name);
  const values = useFormValues();
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const storedValue = scope ? scope.getValue(name) : globalValue;
  const selected = useMemo(() => toValues(storedValue, props.value), [storedValue, props.value]);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Option[] | null>(null);
  const [loading, setLoading] = useState(false);
  const searchAbort = useRef<AbortController | null>(null);

  const optionsByValue = useMemo(() => {
    const map = new Map<string, Option>();

    for (const option of [...staticOptions, ...(results ?? [])]) {
      map.set(option.value, option);
    }

    return map;
  }, [staticOptions, results]);
  const labelFor = (value: string) => optionsByValue.get(value)?.label ?? value;
  const colorFor = (value: string) =>
    coerceColor((optionsByValue.get(value)?.data as { color?: unknown } | undefined)?.color);

  const locked = readOnly || disabled;

  const search = useCallback(
    (query: string) => {
      searchAbort.current?.abort();

      if (query.trim() === "") {
        setResults(null);
        setLoading(false);

        return;
      }

      const controller = new AbortController();
      searchAbort.current = controller;
      setLoading(true);

      if (searchOptions) {
        void searchOptions(searchKey, query, valuesRef.current, controller.signal)
          .then((options) => {
            setResults(options);
            setLoading(false);
          })
          .catch(() => {});

        return;
      }

      void postFormAction<{ options?: Option[] }>(
        action,
        componentRef,
        { ...valuesRef.current, _search: searchKey, q: query },
        controller.signal,
      )
        .then((response) => {
          setResults(response?.options ?? []);
          setLoading(false);
        })
        .catch(() => {});
    },
    [action, componentRef, searchKey, searchOptions],
  );

  function commit(next: string[]): void {
    change(name, multiple ? next : (next[0] ?? ""));
  }

  function select(value: string): void {
    if (multiple) {
      const next = selectedRef.current.includes(value)
        ? selectedRef.current.filter((item) => item !== value)
        : [...selectedRef.current, value];
      selectedRef.current = next;
      commit(next);

      return;
    }

    selectedRef.current = [value];
    commit([value]);
  }

  function remove(value: string): void {
    commit(selected.filter((item) => item !== value));
  }

  function applyCreated(value: string): void {
    if (!multiple) {
      selectedRef.current = [value];
      commit([value]);

      return;
    }

    if (!selectedRef.current.includes(value)) {
      const next = [...selectedRef.current, value];
      selectedRef.current = next;
      commit(next);
    }
  }

  if (hidden) {
    return null;
  }

  const options = searchable ? (results ?? staticOptions) : staticOptions;

  const renderOption = optionSchema?.length
    ? (option: Option) => (
        <Renderer
          nodes={materializeSchema(optionSchema, {
            ...option.data,
            label: option.label,
            value: option.value,
          })}
        />
      )
    : undefined;

  return (
    <FormFieldFrame
      error={errors[errorKey]}
      helperText={props.helperText ?? undefined}
      tooltip={props.tooltip ?? undefined}
      label={props.label ?? ""}
      name={domName}
      required={required}
    >
      {multiple ? (
        selected.map((value) => (
          <input key={value} name={`${domName}[]`} type="hidden" value={value} />
        ))
      ) : (
        <input name={domName} type="hidden" value={selected[0] ?? ""} />
      )}

      <div>
        {multiple && selected.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {selected.map((value) => {
              const color = colorFor(value);

              return (
                <span
                  className="inline-flex items-center gap-1 rounded-lt-sm bg-lt-muted px-2 py-0.5 text-xs"
                  key={value}
                >
                  {color && (
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-full"
                      style={{ background: colorValue(color) }}
                    />
                  )}
                  {labelFor(value)}
                  {!locked && (
                    <button
                      aria-label={t("form.remove-option", "Remove {{label}}", {
                        label: labelFor(value),
                      })}
                      data-test={`select-${name}-remove-${value}`}
                      className="text-lt-muted-fg hover:text-lt-fg [&_svg]:size-lt-icon-xs"
                      onClick={() => remove(value)}
                      type="button"
                    >
                      <Icon name="x" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}

        <Combobox
          creatable={creatable}
          emptyLabel={props.emptyLabel ?? undefined}
          loading={loading}
          multiple={multiple}
          onCommit={applyCreated}
          onCreate={applyCreated}
          onSearch={searchable ? search : undefined}
          onSelect={select}
          open={open && !locked}
          onOpenChange={(next) => {
            setOpen(next);

            if (!next) {
              blur(name);
            }
          }}
          options={options}
          renderOption={renderOption}
          searchPlaceholder={props.searchPlaceholder ?? undefined}
          showSearch={Boolean(searchable || creatable)}
          selected={selected}
          testId={`select-${name}`}
          trigger={
            <>
              {!multiple && selected.length > 0 ? (
                <span>{labelFor(selected[0])}</span>
              ) : (
                <span className="text-lt-muted-fg">{placeholder}</span>
              )}
              <Icon name="chevrons-up-down" className="size-lt-icon-md shrink-0 text-lt-muted-fg" />
            </>
          }
          triggerClassName={cn(
            controlSurface(),
            "flex items-center justify-between gap-2 text-left",
            locked && "cursor-not-allowed opacity-60",
          )}
          triggerProps={{
            "aria-haspopup": "listbox",
            autoFocus: props.autoFocus ?? undefined,
            "data-test": `select-${name}`,
            disabled: locked,
            id: domName,
            tabIndex: props.tabIndex ?? undefined,
          }}
        />
      </div>
    </FormFieldFrame>
  );
};
