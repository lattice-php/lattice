import type { Node } from "@lattice-php/core";
import type { EffectProps as CustomEffectProps, ResolveProps } from "@lattice-php/core";
import type { Variant } from "../button";
import type { Translatable } from "../types";

export type BuiltinEffectProps = {
  callout: {
    action: Node | null;
    dismissible: boolean;
    message: Translatable | string;
    title: Translatable | string | null;
    unique: string | null;
    variant: Variant;
  };
  "close-modal": { readonly modal: string | null };
  download: { readonly url: string };
  "locale-change": { readonly locale: string };
  "open-modal": { readonly modal: string };
  redirect: { readonly url: string };
  "reload-component": { readonly component: string };
  "reload-page": { readonly full: boolean };
  "reset-form": { readonly form: string | null };
  "retract-callout": { readonly unique: string };
  toast: {
    action: Node | null;
    dismissible: boolean;
    duration: number | null;
    message: Translatable | string;
    persistent: boolean;
    variant: Variant;
  };
  "toggle-sidebar": { readonly target: string | null };
};

export type EffectPropsMap = BuiltinEffectProps;
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
