import { EffectOf, EffectProps, EffectPropsMap, EffectPropsOf } from '@lattice-php/core/generated';
export type { EffectOf, EffectProps, EffectPropsOf };
export type EffectHandler<TType extends string = string> = (effect: EffectOf<TType>) => void;
export type EffectHandlerRegistry = Record<string, EffectHandler>;
export declare const EFFECT_HANDLER_REGISTRY_EXTENSION = "effects";
export declare function useEffectHandlerRegistry(): EffectHandlerRegistry;
export type EffectHandlerRegistryFor<TTypes extends keyof EffectPropsMap & string> = Record<TTypes, EffectHandler>;
/**
 * Author a handler against `EffectHandler<"my.type">` for a typed payload, then
 * register it through this — it erases the type parameter for the loose registry.
 */
export declare function effectHandler<TType extends string>(_type: TType, fn: EffectHandler<TType>): EffectHandler;
export declare const builtinEffectHandlers: EffectHandlerRegistryFor<keyof EffectPropsMap & string>;
export declare function mergeEffectHandlers(...registries: Array<EffectHandlerRegistry | undefined>): EffectHandlerRegistry;
