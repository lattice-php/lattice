import { LazyExoticComponent } from "react";
import { RendererComponent, RendererComponentModule, ComponentProps } from "./index.js";
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
export type ComponentRegistryFor<TTypes extends keyof ComponentProps & string> = Record<
  TTypes,
  ComponentRegistration
>;
export type ExtensionRegistry = Record<string, (...args: never[]) => unknown>;
export type ExtensionRegistries = Record<string, ExtensionRegistry>;
export type PluginI18n = {
  /** i18next namespace the plugin's components translate under. */
  namespace: string;
};
export type Plugin = {
  name: string;
  components?: ComponentRegistry;
  columns?: ExtensionRegistry;
  effects?: ExtensionRegistry;
  extensions?: ExtensionRegistries;
  i18n?: PluginI18n;
};
export type Registry = {
  components: ComponentRegistry;
  columns: ExtensionRegistry;
  effects: ExtensionRegistry;
  extensions?: ExtensionRegistries;
};
type CompleteRegistry = Registry & {
  extensions: ExtensionRegistries;
};
export declare function eagerComponent<TType extends string>(
  component: RendererComponent<TType>,
): EagerComponentRegistration;
export declare function lazyComponent<TType extends string>(
  load: () => Promise<RendererComponentModule<TType>>,
): LazyComponentRegistration;
export declare function loadPluginModules(
  urls: string[],
  load?: (url: string) => Promise<unknown>,
): Promise<Plugin[]>;
export declare function createRegistry(...plugins: Plugin[]): CompleteRegistry;
export declare function extendRegistry(registry: Registry, ...plugins: Plugin[]): CompleteRegistry;
