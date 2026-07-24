import type { Node, NodeProps, ComponentPropsOf } from "./types";

// 1. Built-in type narrows correctly: badge requires props.label: string
const _okBadge: Node<"badge"> = { type: "badge", props: { label: "x", color: null } };
// @ts-expect-error label must be a string, not a number
const _badBadge: Node<"badge"> = { type: "badge", props: { label: 1 } };

// 2. Consumer augmentation: extend ComponentProps so "custom.thing" gains strong props.
//    The declare module is scoped to this module file (which has top-level imports), so it
//    does not pollute the project's global type space.
declare module "./types" {
  interface ComponentProps {
    "custom.thing": { foo: number };
  }
}
const _customOk: ComponentPropsOf<"custom.thing"> = { foo: 1 };
// @ts-expect-error foo must be a number, not a string
const _customBad: ComponentPropsOf<"custom.thing"> = { foo: "no" };

// 3. Unaugmented unknown type falls back to the loose NodeProps bag
const _loose: ComponentPropsOf<"totally.unknown"> = { anything: true } satisfies NodeProps;

void _okBadge;
void _badBadge;
void _customOk;
void _customBad;
void _loose;
