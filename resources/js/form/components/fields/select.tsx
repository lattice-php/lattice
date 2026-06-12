import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@lattice/lattice/lib/utils";
import type { Option, RendererComponent } from "@lattice/lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { useFormContext } from "../context";
import { FORM_DEBOUNCE_MS, postFormAction } from "../form-transport";
import { useResolvedNode } from "../resolved-nodes";
import { useDependentField } from "../use-dependent-field";
import { useFieldCommit } from "../use-field-commit";
import { useFormValue } from "../values";

function toValues(stored: unknown, fallback: string | string[] | undefined): string[] {
  const source = stored ?? fallback;

  if (Array.isArray(source)) {
    return source.map(String);
  }

  if (source === undefined || source === null || source === "") {
    return [];
  }

  return [String(source)];
}

export const SelectComponent: RendererComponent<"form.select"> = ({ node }) => {
  const props = node.props;
  const { action, componentRef, errors } = useFormContext();
  const { hidden, required, readOnly, disabled } = useDependentField(node);
  const { change, blur } = useFieldCommit();
  const resolvedNode = useResolvedNode(node);
  const name = props.name;
  const placeholder = props.placeholder || "Select…";
  const multiple = props.multiple ?? false;
  const searchable = props.searchable ?? false;
  const staticOptions = useMemo(
    () => (resolvedNode.props as { options?: Option[] }).options ?? [],
    [resolvedNode.props],
  );

  const storedValue = useFormValue(name);
  const selected = useMemo(() => toValues(storedValue, props.value), [storedValue, props.value]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  const labels = useMemo(() => {
    const map = new Map<string, string>();
    for (const option of [...staticOptions, ...results]) {
      map.set(option.value, option.label);
    }
    return map;
  }, [staticOptions, results]);
  const labelFor = (value: string) => labels.get(value) ?? value;

  const locked = readOnly || disabled;

  useEffect(() => {
    if (!searchable) {
      return;
    }

    if (query.trim() === "") {
      setResults([]);
      setLoading(false);

      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timer = window.setTimeout(() => {
      void postFormAction<{ options?: Option[] }>(
        action,
        componentRef,
        { _search: name, q: query },
        controller.signal,
      )
        .then((response) => {
          setResults(response?.options ?? []);
          setLoading(false);
        })
        .catch(() => {});
    }, FORM_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, searchable, action, componentRef, name]);

  function commit(next: string[]): void {
    change(name, multiple ? next : (next[0] ?? ""));
  }

  function close(): void {
    setOpen(false);
    setQuery("");
    blur(name);
  }

  function pick(option: Option): void {
    if (multiple) {
      const next = selected.includes(option.value)
        ? selected.filter((value) => value !== option.value)
        : [...selected, option.value];
      commit(next);

      return;
    }

    commit([option.value]);
    close();
  }

  function remove(value: string): void {
    commit(selected.filter((item) => item !== value));
  }

  if (hidden) {
    return null;
  }

  const visibleOptions = !searchable
    ? staticOptions.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
    : query.trim() === ""
      ? staticOptions
      : results;

  return (
    <FormFieldFrame error={errors[name]} label={props.label ?? ""} name={name} required={required}>
      {multiple ? (
        selected.map((value) => (
          <input key={value} name={`${name}[]`} type="hidden" value={value} />
        ))
      ) : (
        <input name={name} type="hidden" value={selected[0] ?? ""} />
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
                    aria-label={`Remove ${labelFor(value)}`}
                    data-test={`select-${name}-remove-${value}`}
                    className="text-lt-muted-fg hover:text-lt-fg [&_svg]:size-3"
                    onClick={() => remove(value)}
                    type="button"
                  >
                    <X />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        <Popover.Root
          open={open && !locked}
          onOpenChange={(next) => {
            if (next) {
              setOpen(true);
            } else {
              close();
            }
          }}
        >
          <Popover.Trigger asChild>
            <button
              aria-haspopup="listbox"
              autoFocus={props.autoFocus ?? undefined}
              tabIndex={props.tabIndex ?? undefined}
              data-test={`select-${name}`}
              className={cn(
                "flex min-h-9 w-full items-center justify-between gap-2 rounded-lt-sm border border-lt-input bg-transparent px-3 py-1.5 text-left text-sm shadow-xs transition-colors focus:border-lt-ring focus:outline-none focus:ring-[3px] focus:ring-lt-ring/50",
                locked && "cursor-not-allowed opacity-60",
              )}
              disabled={locked}
              type="button"
            >
              {!multiple && selected.length > 0 ? (
                <span>{labelFor(selected[0])}</span>
              ) : (
                <span className="text-lt-muted-fg">{placeholder}</span>
              )}
              <ChevronsUpDown className="size-4 shrink-0 text-lt-muted-fg" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="start"
              className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lt-sm border border-lt-border bg-lt-bg shadow-md"
              sideOffset={4}
            >
              <div className="flex items-center gap-2 border-b border-lt-border px-3 py-2">
                <input
                  aria-label="Search options"
                  data-test={`select-${name}-search`}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-lt-muted-fg"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchable ? "Search…" : "Filter…"}
                  value={query}
                />
                {loading && <Loader2 className="size-4 shrink-0 animate-spin text-lt-muted-fg" />}
              </div>
              <div className="max-h-60 overflow-y-auto p-1" role="listbox">
                {visibleOptions.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-lt-muted-fg">No options</p>
                ) : (
                  visibleOptions.map((option) => {
                    const isSelected = selected.includes(option.value);

                    return (
                      <button
                        aria-selected={isSelected}
                        data-test={`select-${name}-option-${option.value}`}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lt-sm px-3 py-1.5 text-left text-sm transition-colors hover:bg-lt-accent hover:text-lt-accent-fg",
                          isSelected && "bg-lt-accent/60",
                        )}
                        key={option.value}
                        onClick={() => pick(option)}
                        role="option"
                        type="button"
                      >
                        {option.label}
                        {isSelected && <Check className="size-4 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </FormFieldFrame>
  );
};
