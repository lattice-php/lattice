import { registry as defaultRegistry } from "./registry";
import type { Registry } from "./core/registry";
import { setDefaultRegistry } from "./core/registry-context";
import { ProviderBase, type ProviderBaseProps } from "./provider-base";

// Register the default registry so selectors work outside <Provider>.
// This module is always loaded after registry.ts finishes, so defaultRegistry
// is guaranteed to be defined here.
setDefaultRegistry(defaultRegistry);

type ProviderProps = Omit<ProviderBaseProps, "registry"> & {
  registry?: Registry;
};

export function Provider({ registry = defaultRegistry, ...props }: ProviderProps) {
  return <ProviderBase {...props} registry={registry} />;
}

export {
  useComponentRegistry,
  useColumnRegistry,
  useEffectHandlerRegistry,
} from "./core/registry-context";
