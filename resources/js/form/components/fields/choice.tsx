import { useMemo } from "react";
import type { Option, RendererComponent } from "@lattice/lattice/core/types";
import { SegmentedPills } from "@lattice/lattice/core/components/segmented-pills";
import { FormFieldFrame } from "../base/field";
import { useControlledField } from "../use-controlled-field";
import { useResolvedNode } from "../resolved-nodes";
import { useSeedDefault } from "../use-seed-default";

export const ChoiceComponent: RendererComponent<"form.choice"> = ({ node }) => {
  const resolvedNode = useResolvedNode(node);
  const { name, value, error, hidden, required, readonly, disabled, commit } =
    useControlledField(node);
  const options = useMemo(
    () => (resolvedNode.props as { options?: Option[] }).options ?? [],
    [resolvedNode.props],
  );
  const fallbackValue = options[0]?.value ?? "";
  const selected = value || fallbackValue;

  useSeedDefault(name, selected || undefined);

  if (hidden || options.length === 0) {
    return null;
  }

  return (
    <FormFieldFrame error={error} label={node.props.label ?? ""} name={name} required={required}>
      <input name={name} type="hidden" value={selected} />
      <SegmentedPills
        ariaLabel={node.props.label ?? undefined}
        autoFocus={node.props.autoFocus ?? undefined}
        disabled={readonly || disabled}
        name={name}
        onSelect={commit}
        options={options}
        tabIndex={node.props.tabIndex ?? undefined}
        value={selected}
      />
    </FormFieldFrame>
  );
};
