import type { EffectProps as CustomEffectProps, ResolveProps } from "@lattice-php/core";
import type { EffectPropsMap } from "../generated";

export type { EffectPropsMap };
export interface EffectProps extends CustomEffectProps {}
export type EffectPropsOf<TType extends string> = ResolveProps<
  EffectProps,
  EffectPropsMap,
  TType,
  Record<string, unknown>
>;
export type EffectOf<TType extends string = string> = {
  type: TType;
  props: EffectPropsOf<TType>;
};
export type Effect = EffectOf;
export type ActionResult = {
  readonly data: Record<string, unknown>;
  readonly effects: Effect[];
};
