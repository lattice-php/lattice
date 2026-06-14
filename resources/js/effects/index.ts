import { createPlugin } from "@lattice-php/lattice/core/registry";
import { builtinEffectHandlers } from "./registry";

export const effectsPlugin = createPlugin({
  name: "lattice/effects",
  effects: builtinEffectHandlers,
});
