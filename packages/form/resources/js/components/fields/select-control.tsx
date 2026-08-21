import { Icon } from "@lattice-php/ui/icons";
import { useCallback, useMemo, useRef, useState } from "react";
import { Combobox } from "@lattice-php/form/primitives/combobox";
import { controlSurface } from "@lattice-php/ui/lib/control";
import { coerceColor, colorValue } from "@lattice-php/ui/lib/color";
import { cn } from "@lattice-php/ui/lib/utils";
import { useT } from "@lattice-php/ui/i18n";
import { Renderer } from "@lattice-php/core/renderer";
import { materializeSchema } from "@lattice-php/core/materialize";
import type { Node, Option } from "@lattice-php/core";
import type { FormFieldControlProps } from "../base/field";
import { useFormContext } from "../../hooks/context";
import { fieldDomName } from "../../lib/field-dom-name";
import { postFormAction } from "../../lib/form-transport";
import { useResolvedNode } from "../../hooks/resolved-nodes";
import { useDependentField } from "../../hooks/use-dependent-field";
import { useFieldCommit } from "../../hooks/use-field-commit";
import { useFieldScope } from "../../hooks/field-scope";
import { useFormValue, useFormValues } from "../../hooks/values";

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

/**
 * The frame-less select control: option state, remote search, and the
 * combobox. Shared by the standard select field (which wraps it in a
 * FormFieldFrame) and by affix selects rendered inside another field's
 * AffixGroup, which pass a compact `triggerClassName` instead.
 */
export function SelectControl({
  node,
  controlProps,
  triggerClassName,
}: {
  node: Node<"field.select">;
  controlProps: FormFieldControlProps;
  triggerClassName?: string;
}) {
  const { t } = useT("lattice");
  const props = node.props;
  const { action, componentRef, searchOptions } = useFormContext();
  const { hidden, readOnly, disabled } = useDependentField(node);
  const { change, blur } = useFieldCommit();
  const resolvedNode = useResolvedNode(node);
  const name = props.name;
  const scope = useFieldScope();
  const searchKey = scope ? scope.errorKey(name) : name;
  const placeholder = props.placeholder || "Select…";
  const multiple = props.multiple;
  const searchable = props.searchable;
  const creatable = props.creatable;
  const staticOptions = useMemo(() => resolvedNode.props.options, [resolvedNode.props]);
  const optionSchema = resolvedNode.props.optionSchema;

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
        { ...valuesRef.current, _sub: "search", _target: searchKey, _q: query },
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
    <>
      {multiple ? (
        selected.map((value) => (
          <input key={value} name={`${controlProps.id}[]`} type="hidden" value={value} />
        ))
      ) : (
        <input name={controlProps.id} type="hidden" value={selected[0] ?? ""} />
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
            triggerClassName ?? cn(controlSurface(), "flex items-center justify-between gap-2"),
            "text-left",
            locked && "cursor-not-allowed opacity-60",
          )}
          triggerProps={{
            ...controlProps,
            "aria-haspopup": "listbox",
            autoFocus: props.autoFocus ?? undefined,
            "data-test": `select-${name}`,
            disabled: locked,
            tabIndex: props.tabIndex ?? undefined,
          }}
        />
      </div>
    </>
  );
}

/** The DOM name/id an affix select control submits and labels itself under. */
export function useSelectDomName(name: string): string {
  const { fieldIdPrefix } = useFormContext();
  const scope = useFieldScope();

  return fieldDomName(scope ? scope.scopedName(name) : name, fieldIdPrefix);
}
