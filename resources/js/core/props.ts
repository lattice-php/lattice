import type { LatticeNodeProps } from "./types";

export function getStringProp(props: LatticeNodeProps | undefined, name: string, fallback = "") {
  const value = props?.[name];

  return typeof value === "string" ? value : fallback;
}

export function getNumberProp(props: LatticeNodeProps | undefined, name: string, fallback: number) {
  const value = props?.[name];

  return typeof value === "number" ? value : fallback;
}

export function getOptionalNumberProp(props: LatticeNodeProps | undefined, name: string) {
  const value = props?.[name];

  return typeof value === "number" ? value : undefined;
}

export function getBooleanProp(
  props: LatticeNodeProps | undefined,
  name: string,
  fallback = false,
) {
  const value = props?.[name];

  return typeof value === "boolean" ? value : fallback;
}
