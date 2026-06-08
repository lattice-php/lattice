import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@lattice/lib/utils";
import { getOptionalNumberProp, getStringProp } from "@lattice/core/props";
import type { NodeProps, RendererComponent } from "@lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { useFormContext } from "../context";
import { useResolvedNode } from "../resolved-nodes";
import { useDependentField } from "../use-dependent-field";
import { useFormValue, useSetFormValue } from "../values";

type ChoiceOption = {
  label: string;
  value: string;
};

function getChoiceOptions(props: NodeProps | undefined): ChoiceOption[] {
  const value = props?.options;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (option): option is ChoiceOption =>
      typeof option === "object" &&
      option !== null &&
      typeof option.label === "string" &&
      typeof option.value === "string",
  );
}

declare module "@lattice/core/types" {
  interface ComponentProps {
    "form.choice": {
      event?: string;
      label?: string;
      name?: string;
      options?: ChoiceOption[];
      tabIndex?: number;
      value?: string;
    };
  }
}

export const ChoiceComponent: RendererComponent<"form.choice"> = ({ node }) => {
  const { clearErrors, errors, precognitive, validate } = useFormContext();
  const { hidden, required, readonly, disabled } = useDependentField(node);
  const resolvedNode = useResolvedNode(node);
  const name = getStringProp(node.props, "name");
  const setValue = useSetFormValue();
  const storedValue = useFormValue(name);
  const options = useMemo(() => getChoiceOptions(resolvedNode.props), [resolvedNode.props]);
  const fallbackValue = options[0]?.value ?? "";
  const value =
    storedValue !== undefined
      ? String(storedValue)
      : typeof node.props?.value === "string"
        ? node.props.value
        : fallbackValue;
  const event = getStringProp(node.props, "event");
  const [selectedValue, setSelectedValue] = useState(value);
  const hasMounted = useRef(false);
  const validateRef = useRef(validate);
  const clearErrorsRef = useRef(clearErrors);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    setValue(name, selectedValue);
  }, [name, selectedValue, setValue]);

  useEffect(() => {
    validateRef.current = validate;
    clearErrorsRef.current = clearErrors;
  }, [clearErrors, validate]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;

      return;
    }

    if (precognitive) {
      validateRef.current(name);
    } else {
      clearErrorsRef.current(name);
    }
  }, [name, precognitive, selectedValue]);

  function selectOption(nextValue: string): void {
    setSelectedValue(nextValue);

    if (event) {
      window.dispatchEvent(
        new CustomEvent(event, {
          detail: {
            name,
            value: nextValue,
          },
        }),
      );
    }
  }

  if (hidden || options.length === 0) {
    return null;
  }

  const locked = readonly || disabled;

  return (
    <FormFieldFrame
      error={errors[name]}
      label={getStringProp(node.props, "label")}
      name={name}
      required={required}
    >
      <input name={name} type="hidden" value={selectedValue} />
      <div
        aria-label={getStringProp(node.props, "label")}
        className="inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-lt bg-lt-muted p-1"
        role="radiogroup"
      >
        {options.map((option) => {
          const isSelected = selectedValue === option.value;

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
