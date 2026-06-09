import type { NodeProps } from "./types";

export type Option = {
  label: string;
  value: string;
};

/**
 * Read and validate an `options` prop, keeping only well-formed `{ label, value }`
 * entries. Shared by the choice/select form fields and the segmented control.
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

export function getStringProp(props: NodeProps | undefined, name: string, fallback = "") {
  const value = props?.[name];

  return typeof value === "string" ? value : fallback;
}

export function getNumberProp(props: NodeProps | undefined, name: string, fallback: number) {
  const value = props?.[name];

  return typeof value === "number" ? value : fallback;
}

export function getOptionalNumberProp(props: NodeProps | undefined, name: string) {
  const value = props?.[name];

  return typeof value === "number" ? value : undefined;
}

export function getBooleanProp(props: NodeProps | undefined, name: string, fallback = false) {
  const value = props?.[name];

  return typeof value === "boolean" ? value : fallback;
}
