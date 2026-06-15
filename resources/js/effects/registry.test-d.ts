import type { EffectOf, EffectProps } from "./registry";

// 1. Built-in effect resolves to { type, ...payload } from the generated union.
const _redirect: EffectOf<"redirect"> = { type: "redirect", url: "/next" };
// @ts-expect-error url must be a string, not a number
const _redirectBad: EffectOf<"redirect"> = { type: "redirect", url: 1 };

// 2. Consumer augmentation maps the type to its payload; EffectOf adds `type` back,
//    so a custom effect carries `type` exactly like a built-in one.
declare module "./registry" {
  interface EffectProps {
    confetti: { color: string };
  }
}
const _confetti: EffectOf<"confetti"> = { type: "confetti", color: "gold" };
// @ts-expect-error color must be a string, not a number
const _confettiBad: EffectOf<"confetti"> = { type: "confetti", color: 1 };
const _confettiType: "confetti" = _confetti.type;

// 3. Unaugmented unknown effect resolves to a loose { type } & bag.
const _loose: EffectOf<"totally.unknown"> = { type: "totally.unknown", anything: true };

void _redirect;
void _redirectBad;
void _confetti;
void _confettiBad;
void _confettiType;
void _loose;

type _EffectProps = EffectProps;
