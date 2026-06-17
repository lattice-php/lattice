import type { FilterData, Option } from "@lattice-php/lattice/types/generated";

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
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.values(value).every(isEmptyMember);
  }

  return false;
}

export function isActiveFilterValue(value: unknown): boolean {
  return !isEmptyFilterValue(value);
}

/**
 * Read a string entry from a filter's loose `props` bag, falling back when the
 * key is absent or not a string.
 */
export function stringProp(filter: FilterData, key: string, fallback: string): string {
  const value = filter.props[key];

  return typeof value === "string" ? value : fallback;
}

export function filterOptions(filter: FilterData): Option[] {
  const value = filter.props.options;

  return Array.isArray(value) ? (value as Option[]) : [];
}
