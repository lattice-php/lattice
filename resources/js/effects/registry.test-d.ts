import type { EffectOf, EffectProps } from "./registry";

// 1. Built-in effect resolves from the generated union (redirect carries a url).
const _redirect: EffectOf<"redirect"> = { type: "redirect", url: "/next" };
// @ts-expect-error url must be a string, not a number
const _redirectBad: EffectOf<"redirect"> = { type: "redirect", url: 1 };

// 2. Consumer augmentation: extend EffectProps so "confetti" types its payload.
//    The declare module is scoped to this module file (which has top-level imports).
declare module "./registry" {
  interface EffectProps {
    confetti: { color: string };
  }
}
const _confetti: EffectOf<"confetti"> = { color: "gold" };
// @ts-expect-error color must be a string, not a number
const _confettiBad: EffectOf<"confetti"> = { color: 1 };

// 3. Unaugmented unknown effect falls back to the loose Effect union.
const _loose: EffectOf<"totally.unknown"> = { type: "redirect", url: "/x" };

void _redirect;
void _redirectBad;
void _confetti;
void _confettiBad;
void _loose;

type _EffectProps = EffectProps;
