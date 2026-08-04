import type { ColumnProps, ColumnPropsOf, CommonColumnProps, FilterPropsOf } from "./types";

// Augment ColumnProps locally — scoped to this module (has top-level imports).
declare module "./types" {
  interface ColumnProps {
    "column.rating": { max: number };
  }
}

const commonColumnProps: CommonColumnProps = {
  label: "Rating",
  width: "md",
  align: "start",
  sortable: false,
  toggleable: false,
  hiddenByDefault: false,
  filter: null,
};

// 1. Augmented type narrows correctly.
const _ok: ColumnPropsOf<"column.rating"> = { max: 5 };
// @ts-expect-error max must be a number, not a string
const _bad: ColumnPropsOf<"column.rating"> = { max: "five" };

// 2. Unaugmented type falls back to the loose bag plus the base Column props.
const _loose: ColumnPropsOf<"totally.unknown"> = { ...commonColumnProps, anything: true };

void _ok;
void _bad;
void _loose;

type _ColumnProps = ColumnProps;

// 3. Built-in column type resolves from the generated map, common concerns included.
const _builtin: ColumnPropsOf<"column.badge"> = {
  ...commonColumnProps,
  colors: { active: { kind: "named", value: "green", dark: null } },
};
// @ts-expect-error colors must be a record of Color values, not a number
const _builtinBad: ColumnPropsOf<"column.badge"> = { colors: 1 };
void _builtin;
void _builtinBad;

// Built-in select filter props resolve through the generated FilterPropsMap.
const _selectFilter: FilterPropsOf<"filter.select"> = {
  label: "Status",
  multiple: false,
  searchable: false,
  options: [],
  placeholder: null,
};

// @ts-expect-error - multiple must be a boolean
const _selectFilterBad: FilterPropsOf<"filter.select"> = { multiple: 1 };

// Unknown filter types fall back to the generated Filter base plus a loose bag.
const _looseFilter: FilterPropsOf<"totally.unknown"> = { anything: true, label: null };

void _selectFilter;
void _selectFilterBad;
void _looseFilter;
