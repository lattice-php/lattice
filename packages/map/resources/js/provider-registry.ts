import type { ComponentType, LazyExoticComponent } from "react";
import { useExtensionRegistry } from "@lattice-php/core/registry-context";
import type { Node } from "@lattice-php/core";

export const MAP_PROVIDER_REGISTRY_EXTENSION = "map.providers";

export type MapProviderProps = {
  node: Node<"map">;
};

export type MapProviderComponent =
  | ComponentType<MapProviderProps>
  | LazyExoticComponent<ComponentType<MapProviderProps>>;

export type MapProviderRegistry = Record<string, MapProviderComponent>;

export function useMapProviderRegistry(): MapProviderRegistry {
  return useExtensionRegistry<MapProviderRegistry>(MAP_PROVIDER_REGISTRY_EXTENSION);
}
