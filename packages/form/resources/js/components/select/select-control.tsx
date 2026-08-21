import { useCallback, useMemo, useRef, useState } from "react";
import { coerceColor } from "@lattice-php/ui/lib/color";
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
import { MultiSelect } from "./select";

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

      <MultiSelect
        creatable={creatable}
        emptyLabel={props.emptyLabel ?? undefined}
        loading={loading}
        locked={locked}
        multiple={multiple}
        onCreate={applyCreated}
        onOpenChange={(next) => {
          if (!next) {
            blur(name);
          }
        }}
        onRemove={remove}
        onSearch={searchable ? search : undefined}
        onSelect={select}
        options={options}
        placeholder={placeholder}
        renderOption={renderOption}
        searchPlaceholder={props.searchPlaceholder ?? undefined}
        selectedItems={selected.map((value) => ({
          color: colorFor(value),
          label: labelFor(value),
          value,
        }))}
        showSearch={Boolean(searchable || creatable)}
        testId={`select-${name}`}
        triggerClassName={triggerClassName}
        triggerProps={{
          ...controlProps,
          "aria-haspopup": "listbox",
          autoFocus: props.autoFocus ?? undefined,
          "data-test": `select-${name}`,
          disabled: locked,
          tabIndex: props.tabIndex ?? undefined,
        }}
      />
    </>
  );
}

/** The DOM name/id an affix select control submits and labels itself under. */
export function useSelectDomName(name: string): string {
  const { fieldIdPrefix } = useFormContext();
  const scope = useFieldScope();

  return fieldDomName(scope ? scope.scopedName(name) : name, fieldIdPrefix);
}
