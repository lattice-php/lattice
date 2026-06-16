import type { ColumnProps, ColumnPropsOf } from "./types";

// Augment ColumnProps locally — scoped to this module (has top-level imports).
declare module "./types" {
  interface ColumnProps {
    "column.rating": { max: number };
  }
}

// 1. Augmented type narrows correctly.
const _ok: ColumnPropsOf<"column.rating"> = { max: 5 };
// @ts-expect-error max must be a number, not a string
const _bad: ColumnPropsOf<"column.rating"> = { max: "five" };

// 2. Unaugmented type falls back to the loose bag.
const _loose: ColumnPropsOf<"totally.unknown"> = { anything: true };

// Silence unused-variable warnings
void _ok;
void _bad;
void _loose;

// Silence unused import warning
type _ColumnProps = ColumnProps;

// 3. Built-in column type resolves from the generated map.
const _builtin: ColumnPropsOf<"column.badge"> = { colors: { active: "green" } };
// @ts-expect-error colors must be a record of strings, not a number
const _builtinBad: ColumnPropsOf<"column.badge"> = { colors: 1 };
void _builtin;
void _builtinBad;
