import { Icon } from "@lattice-php/lattice/icons";
import { useCallback, useMemo, useRef, useState } from "react";
import { Combobox } from "@lattice-php/lattice/ui/combobox";
import { controlSurface } from "@lattice-php/lattice/ui/control";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
import type { Option, RendererComponent } from "@lattice-php/lattice/core/types";
import { FormFieldFrame } from "../base/field";
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
  const staticOptions = useMemo(
    () => (resolvedNode.props as { options?: Option[] }).options ?? [],
    [resolvedNode.props],
  );

  const globalValue = useFormValue(name);
  const values = useFormValues();
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const storedValue = scope ? scope.getValue(name) : globalValue;
  const selected = useMemo(() => toValues(storedValue, props.value), [storedValue, props.value]);

  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Option[] | null>(null);
  const [loading, setLoading] = useState(false);
  const searchAbort = useRef<AbortController | null>(null);

  const labels = useMemo(() => {
    const map = new Map<string, string>();
    for (const option of [...staticOptions, ...(results ?? [])]) {
      map.set(option.value, option.label);
    }
    return map;
  }, [staticOptions, results]);
  const labelFor = (value: string) => labels.get(value) ?? value;

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
      commit(
        selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value],
      );

      return;
    }

    commit([value]);
  }

  function remove(value: string): void {
    commit(selected.filter((item) => item !== value));
  }

  if (hidden) {
    return null;
  }

  const options = searchable ? (results ?? staticOptions) : staticOptions;

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
            {selected.map((value) => (
              <span
                className="inline-flex items-center gap-1 rounded-lt-sm bg-lt-muted px-2 py-0.5 text-xs"
                key={value}
              >
                {labelFor(value)}
                {!locked && (
                  <button
                    aria-label={t("form.removeOption", "Remove {{label}}", {
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
            ))}
          </div>
        )}

        <Combobox
          emptyLabel={props.emptyLabel ?? undefined}
          loading={loading}
          multiple={multiple}
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
          searchPlaceholder={props.searchPlaceholder ?? undefined}
          showSearch={Boolean(searchable)}
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
