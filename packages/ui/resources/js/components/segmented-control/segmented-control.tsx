import { useState } from "react";
import type { SegmentedPillsProps } from "../../segmented-pills";
import { SegmentedPills } from "../../segmented-pills";

export type SegmentedControlProps = Omit<SegmentedPillsProps, "onSelect" | "value"> & {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

export function SegmentedControl({
  defaultValue,
  onValueChange,
  options,
  value,
  ...props
}: SegmentedControlProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? options[0]?.value ?? "",
  );
  const selectedValue = value ?? uncontrolledValue;

  if (options.length === 0) {
    return null;
  }

  function select(nextValue: string): void {
    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(nextValue);
  }

  return <SegmentedPills {...props} onSelect={select} options={options} value={selectedValue} />;
}
