import type { ColumnProps, EffectProps, FilterProps, NodeProps, ComponentPropsOf } from "./index";

declare module "./index" {
  interface ComponentProps {
    "custom.thing": { foo: number };
  }

  interface ColumnProps {
    "column.custom": { color: string };
  }

  interface FilterProps {
    "filter.custom": { query: string };
  }

  interface EffectProps {
    "effect.custom": { value: number };
  }
}
const _customOk: ComponentPropsOf<"custom.thing"> = { foo: 1 };
// @ts-expect-error foo must be a number, not a string
const _customBad: ComponentPropsOf<"custom.thing"> = { foo: "no" };

const _loose: ComponentPropsOf<"totally.unknown"> = { anything: true } satisfies NodeProps;
const _column: ColumnProps["column.custom"] = { color: "blue" };
const _filter: FilterProps["filter.custom"] = { query: "active" };
const _effect: EffectProps["effect.custom"] = { value: 1 };

void _customOk;
void _customBad;
void _loose;
void _column;
void _filter;
void _effect;
