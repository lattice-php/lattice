import type { EffectOf, EffectProps } from "./registry";

// 1. Built-in effect resolves to { type, props } from the generated union.
const _redirect: EffectOf<"redirect"> = { type: "redirect", props: { url: "/next" } };
// @ts-expect-error url must be a string, not a number
const _redirectBad: EffectOf<"redirect"> = { type: "redirect", props: { url: 1 } };

// 2. Consumer augmentation maps the type to its props; EffectOf wraps them in
//    the envelope, so a custom effect carries `type` exactly like a built-in one.
declare module "./registry" {
  interface EffectProps {
    confetti: { color: string };
  }
}
const _confetti: EffectOf<"confetti"> = { type: "confetti", props: { color: "gold" } };
// @ts-expect-error color must be a string, not a number
const _confettiBad: EffectOf<"confetti"> = { type: "confetti", props: { color: 1 } };
const _confettiType: "confetti" = _confetti.type;

// 3. Unaugmented unknown effect resolves to the envelope with a loose props bag.
const _loose: EffectOf<"totally.unknown"> = { type: "totally.unknown", props: { anything: true } };

void _redirect;
void _redirectBad;
void _confetti;
void _confettiBad;
void _confettiType;
void _loose;

type _EffectProps = EffectProps;
