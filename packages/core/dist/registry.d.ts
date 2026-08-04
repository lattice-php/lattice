import { LazyExoticComponent } from 'react';
import { RendererComponent, RendererComponentModule } from './index.js';
export type EagerComponentRegistration = {
    component: RendererComponent;
    mode: "eager";
};
export type LazyComponentRegistration = {
    component: LazyExoticComponent<RendererComponent>;
    load: () => Promise<RendererComponentModule>;
    mode: "lazy";
};
export type ComponentRegistration = EagerComponentRegistration | LazyComponentRegistration;
export type ComponentRegistry = Record<string, ComponentRegistration>;
export type ComponentRegistryFor<TTypes extends string> = Record<TTypes, ComponentRegistration>;
export type ExtensionRegistry = Record<string, (...args: never[]) => unknown>;
export type ExtensionRegistries = Record<string, ExtensionRegistry>;
export type PluginI18n = {
    /** i18next namespace the plugin's components translate under. */
    namespace: string;
};
export type Plugin = {
    name: string;
    components?: ComponentRegistry;
    extensions?: ExtensionRegistries;
    i18n?: PluginI18n;
};
export type Registry = {
    components: ComponentRegistry;
    extensions: ExtensionRegistries;
};
export declare function eagerComponent<TType extends string>(component: RendererComponent<TType>): EagerComponentRegistration;
export declare function lazyComponent<TType extends string>(load: () => Promise<RendererComponentModule<TType>>): LazyComponentRegistration;
export declare function loadPluginModules(urls: string[], load?: (url: string) => Promise<unknown>): Promise<Plugin[]>;
export declare function createRegistry(...plugins: Plugin[]): Registry;
export declare function extendRegistry(registry: Registry, ...plugins: Plugin[]): Registry;
