import type { EffectPropsMap } from "@lattice-php/lattice/types/generated";
import type { EffectOf, EffectPropsOf } from "@lattice-php/lattice/effects/registry";

export function effect<K extends keyof EffectPropsMap & string>(
  type: K,
  props: EffectPropsOf<K>,
): EffectOf<K> {
  return { type, props };
}
