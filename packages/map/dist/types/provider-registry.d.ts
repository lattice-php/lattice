import { ComponentType, LazyExoticComponent } from 'react';
import { Node } from '@lattice-php/core';
export declare const MAP_PROVIDER_REGISTRY_EXTENSION = "map.providers";
export type MapProviderProps = {
    node: Node<"map">;
};
export type MapProviderComponent = ComponentType<MapProviderProps> | LazyExoticComponent<ComponentType<MapProviderProps>>;
export type MapProviderRegistry = Record<string, MapProviderComponent>;
export declare function useMapProviderRegistry(): MapProviderRegistry;
