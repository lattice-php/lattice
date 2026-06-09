import type { NodeProps } from "@lattice/core/types";

export type Option = {
  label: string;
  value: string;
};

/**
 * Read and validate the `options` prop shared by the choice and select fields,
 * keeping only well-formed `{ label, value }` entries.
 */
export function getOptions(props: NodeProps | undefined): Option[] {
  const value = props?.options;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (option): option is Option =>
      typeof option === "object" &&
      option !== null &&
      typeof option.label === "string" &&
      typeof option.value === "string",
  );
}
