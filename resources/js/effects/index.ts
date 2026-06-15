import { createPlugin } from "@lattice-php/lattice/core/registry";
import { builtinEffectHandlers } from "./registry";

/**
 * Seeds the default registry's `effects` with the built-in handlers, so a
 * registry inspected via `useEffectHandlerRegistry()` is a complete, introspectable
 * set rather than only the consumer's additions. useEffectDispatcher also merges
 * the built-ins directly (see use-effect-dispatcher.ts), which is what guarantees
 * they still fire for a bare registry that doesn't extend the default — so the
 * two paths are intentional: this one for introspection, that one for safety.
 */
export const effectsPlugin = createPlugin({
  name: "lattice/effects",
  effects: builtinEffectHandlers,
});
