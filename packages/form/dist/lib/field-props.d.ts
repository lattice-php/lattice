import { Node } from '@lattice-php/core/types';
import { ComponentPropsMap } from '@lattice-php/core/generated';
/**
 * The props every form-field node shares (the PHP Field base). Nodes flow through
 * the form framework loosely typed via the generic schema, so this is the typed
 * lens the shared hooks read them through. Everything is optional because the
 * lens is also applied to non-field nodes while walking the schema. Derived from
 * a generated field type (every field bakes the base in) rather than hand-written.
 */
type FieldProps = Partial<Pick<ComponentPropsMap["field.text-input"], "conditions" | "dependsOnAny" | "dependsOnKeys" | "disabled" | "editablePrefill" | "helperText" | "label" | "name" | "prefillRefreshOn" | "prefillResetOn" | "readOnly" | "required" | "tooltip" | "value">>;
/**
 * Field types whose value is a collection of rows. Schema walkers must not
 * descend into their child schemas as top-level fields; children live under
 * `name.<index>.` paths instead.
 */
export declare const ROW_FIELD_TYPES: Set<string>;
export declare function fieldProps(node: Node): FieldProps;
export declare function walkFields(nodes: Node[] | undefined, visit: (props: FieldProps, node: Node) => void): void;
export {};
