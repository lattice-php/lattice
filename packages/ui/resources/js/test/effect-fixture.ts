import type { EffectOf, EffectPropsOf } from "../effects/types";
import type { EffectPropsMap } from "../effects/types";

export function effect<K extends keyof EffectPropsMap & string>(
  type: K,
  props: EffectPropsOf<K>,
): EffectOf<K> {
  return { type, props };
}
