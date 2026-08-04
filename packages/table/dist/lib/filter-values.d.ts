import { Option } from '@lattice-php/core/generated';
import { FilterNode } from '../types.js';
/**
 * Whether a single scalar filter member is absent — the atomic rule the
 * filter-emptiness and query-serialization logic both build on.
 */
export declare function isEmptyMember(value: unknown): value is null | undefined | "";
/**
 * Whether a table-filter value should clear the filter rather than apply it —
 * an empty string, empty list, or an object whose every member is empty.
 */
export declare function isEmptyFilterValue(value: unknown): boolean;
export declare function isActiveFilterValue(value: unknown): boolean;
/**
 * Whether a value has the wire shape of a dedicated-filter value: a plain
 * `field => value` record.
 */
export declare function isFilterValue(value: unknown): value is Record<string, unknown>;
export declare function filterValue(value: unknown): Record<string, unknown>;
/**
 * Read a string entry from a filter's loose `props` bag, falling back when the
 * key is absent or not a string.
 */
export declare function stringProp(filter: FilterNode<string>, key: string, fallback: string): string;
export declare function filterOptions(filter: FilterNode<string>): Option[];
