import { useEffect, useMemo } from "react";
import type { Option, RendererComponent } from "@lattice/lattice/core/types";
import { SegmentedPills } from "@lattice/lattice/core/components/segmented-pills";
import { FormFieldFrame } from "../base/field";
import { useControlledField } from "../use-controlled-field";
import { useResolvedNode } from "../resolved-nodes";
import { useFormValue, useSetFormValue } from "../values";

export const ChoiceComponent: RendererComponent<"form.choice"> = ({ node }) => {
  const resolvedNode = useResolvedNode(node);
  const { name, value, error, hidden, required, readonly, disabled, commit } =
    useControlledField(node);
  const storedValue = useFormValue(name);
  const setValue = useSetFormValue();
  const options = useMemo(
    () => (resolvedNode.props as { options?: Option[] }).options ?? [],
    [resolvedNode.props],
  );
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
    <FormFieldFrame error={error} label={node.props.label ?? ""} name={name} required={required}>
      <input name={name} type="hidden" value={selected} />
      <SegmentedPills
        ariaLabel={node.props.label ?? undefined}
        disabled={readonly || disabled}
        onSelect={commit}
        options={options}
        value={selected}
      />
    </FormFieldFrame>
  );
};
