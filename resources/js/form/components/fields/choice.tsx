import { useEffect, useMemo } from "react";
import { cn } from "@lattice/lib/utils";
import { getOptionalNumberProp, getStringProp } from "@lattice/core/props";
import type { RendererComponent } from "@lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { type Option, getOptions } from "../options";
import { useControlledField } from "../use-controlled-field";
import { useResolvedNode } from "../resolved-nodes";
import { useFormValue, useSetFormValue } from "../values";

declare module "@lattice/core/types" {
  interface ComponentProps {
    "form.choice": {
      event?: string;
      label?: string;
      name?: string;
      options?: Option[];
      tabIndex?: number;
      value?: string;
    };
  }
}

export const ChoiceComponent: RendererComponent<"form.choice"> = ({ node }) => {
  const resolvedNode = useResolvedNode(node);
  const { name, value, error, hidden, required, readonly, disabled, commit } =
    useControlledField(node);
  const storedValue = useFormValue(name);
  const setValue = useSetFormValue();
  const options = useMemo(() => getOptions(resolvedNode.props), [resolvedNode.props]);
  const fallbackValue = options[0]?.value ?? "";
  const selected = value || fallbackValue;
  const event = getStringProp(node.props, "event");

  // Seed the store with the default selection so dependent fields and the
  // submitted payload reflect it before the user interacts.
  useEffect(() => {
    if (storedValue === undefined && selected) {
      setValue(name, selected);
    }
  }, [name, storedValue, selected, setValue]);

  if (hidden || options.length === 0) {
    return null;
  }

  const locked = readonly || disabled;

  function selectOption(next: string): void {
    commit(next);

    if (event) {
      window.dispatchEvent(new CustomEvent(event, { detail: { name, value: next } }));
    }
  }

  return (
    <FormFieldFrame
      error={error}
      label={getStringProp(node.props, "label")}
      name={name}
      required={required}
    >
      <input name={name} type="hidden" value={selected} />
      <div
        aria-label={getStringProp(node.props, "label")}
        className="inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-lt bg-lt-muted p-1"
        role="radiogroup"
      >
        {options.map((option) => {
          const isSelected = selected === option.value;

          return (
            <button
              aria-checked={isSelected}
              className={cn(
                "whitespace-nowrap rounded-lt-sm px-3 py-1.5 text-sm font-medium transition-colors",
                isSelected
                  ? "bg-lt-bg text-lt-fg shadow-xs"
                  : "text-lt-muted-fg hover:bg-lt-bg/60 hover:text-lt-fg",
                locked && "cursor-not-allowed opacity-60",
              )}
              disabled={locked}
              key={option.value}
              onClick={() => selectOption(option.value)}
              role="radio"
              tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </FormFieldFrame>
  );
};
