import { createPlugin } from "@lattice-php/lattice/core/registry";
import { builtinEffectHandlers } from "./registry";

export const effectComponents = createPlugin({
  name: "lattice/effects",
  effects: builtinEffectHandlers,
});
