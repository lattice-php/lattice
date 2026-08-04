import { createContext, useContext } from "react";
import type { ComponentRegistry, ExtensionRegistry, Registry } from "./registry";

export const RegistryContext = createContext<Registry | null>(null);

let _defaultRegistry: Registry | null = null;
const EMPTY_REGISTRY: ComponentRegistry & ExtensionRegistry = {};

export function setDefaultRegistry(registry: Registry): void {
  _defaultRegistry = registry;
}

export function useComponentRegistry(): ComponentRegistry {
  const registry = useContext(RegistryContext) ?? _defaultRegistry;
  return registry?.components ?? EMPTY_REGISTRY;
}

export function useExtensionRegistry<TRegistry extends ExtensionRegistry>(name: string): TRegistry {
  const registry = useContext(RegistryContext) ?? _defaultRegistry;
  return (registry?.extensions[name] ?? EMPTY_REGISTRY) as TRegistry;
}
