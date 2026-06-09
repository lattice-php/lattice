import { useEffect, useMemo } from "react";
import { type Option, getOptionalNumberProp, getOptions, getStringProp } from "@lattice/core/props";
import type { RendererComponent } from "@lattice/core/types";
import { SegmentedPills } from "@lattice/core/components/segmented-pills";
import { FormFieldFrame } from "../base/field";
import { useControlledField } from "../use-controlled-field";
import { useResolvedNode } from "../resolved-nodes";
import { useFormValue, useSetFormValue } from "../values";

declare module "@lattice/core/types" {
  interface ComponentProps {
    "form.choice": {
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

  return (
    <FormFieldFrame
      error={error}
      label={getStringProp(node.props, "label")}
      name={name}
      required={required}
    >
      <input name={name} type="hidden" value={selected} />
      <SegmentedPills
        ariaLabel={getStringProp(node.props, "label")}
        disabled={readonly || disabled}
        onSelect={commit}
        options={options}
        tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
        value={selected}
      />
    </FormFieldFrame>
  );
};
