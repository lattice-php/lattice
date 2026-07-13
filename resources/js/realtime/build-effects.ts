import type { Effect } from "@lattice-php/lattice/types/generated";
import { isTranslatable, resolveTranslatable } from "@lattice-php/lattice/i18n/translatable";
import type { Translate } from "@lattice-php/lattice/i18n/translatable";

type RawEffect = Record<string, unknown>;

export function buildEffects(
  effects: readonly RawEffect[],
  payload: Record<string, unknown>,
  t: Translate,
): Effect[] {
  return effects.map((effect) => resolveEffect(effect, payload, t)) as Effect[];
}

function resolveEffect(
  effect: RawEffect,
  payload: Record<string, unknown>,
  t: Translate,
): RawEffect {
  if (effect.type !== "toast") {
    return effect;
  }

  const props = effect.props;

  if (typeof props !== "object" || props === null) {
    return effect;
  }

  const message = (props as Record<string, unknown>).message;

  if (!isTranslatable(message)) {
    return effect;
  }

  return {
    ...effect,
    props: {
      ...(props as Record<string, unknown>),
      message: resolveTranslatable(message, payload, t),
    },
  };
}
