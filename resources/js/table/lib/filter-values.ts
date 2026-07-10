import type { Option } from "@lattice-php/lattice/types/generated";
import type { FilterNode } from "@lattice-php/lattice/table/types";

/**
 * Whether a single scalar filter member is absent — the atomic rule the
 * filter-emptiness and query-serialization logic both build on.
 */
export function isEmptyMember(value: unknown): value is null | undefined | "" {
  return value == null || value === "";
}

/**
 * Whether a table-filter value should clear the filter rather than apply it —
 * an empty string, empty list, or an object whose every member is empty.
 */
export function isEmptyFilterValue(value: unknown): boolean {
  if (isEmptyMember(value)) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isEmptyFilterValue);
  }

  if (typeof value === "object" && value !== null) {
    return Object.values(value).every(isEmptyFilterValue);
  }

  return false;
}

export function isActiveFilterValue(value: unknown): boolean {
  return !isEmptyFilterValue(value);
}

/**
 * Whether a value has the wire shape of a dedicated-filter value: a plain
 * `field => value` record.
 */
export function isFilterValue(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function filterValue(value: unknown): Record<string, unknown> {
  return isFilterValue(value) ? value : {};
}

/**
 * Read a string entry from a filter's loose `props` bag, falling back when the
 * key is absent or not a string.
 */
export function stringProp(filter: FilterNode<string>, key: string, fallback: string): string {
  const value = filter.props[key];

  return typeof value === "string" ? value : fallback;
}

export function filterOptions(filter: FilterNode<string>): Option[] {
  const value = filter.props.options;

  return Array.isArray(value) ? (value as Option[]) : [];
}
