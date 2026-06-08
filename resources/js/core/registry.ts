import { lazy } from "react";
import type { LazyExoticComponent } from "react";
import type { RendererComponent, RendererComponentModule } from "./types";

export type EagerComponentRegistration = {
  component: RendererComponent;
  mode: "eager";
};

export type LazyComponentRegistration = {
  component: LazyExoticComponent<RendererComponent>;
  fallback?: RendererComponent;
  load: () => Promise<RendererComponentModule>;
  mode: "lazy";
};

export type ComponentRegistration = EagerComponentRegistration | LazyComponentRegistration;

export type ComponentRegistry = Record<string, ComponentRegistration>;

export type Plugin = {
  components: ComponentRegistry;
  name: string;
};

export type LazyComponentOptions<TType extends string> = {
  fallback?: RendererComponent<TType>;
};

export function eagerComponent<TType extends string>(
  component: RendererComponent<TType>,
): EagerComponentRegistration {
  return {
    component: component as RendererComponent,
    mode: "eager",
  };
}

export function lazyComponent<TType extends string>(
  load: () => Promise<RendererComponentModule<TType>>,
  options: LazyComponentOptions<TType> = {},
): LazyComponentRegistration {
  const erasedLoader = load as unknown as () => Promise<RendererComponentModule>;

  return {
    component: lazy(erasedLoader),
    fallback: options.fallback as RendererComponent | undefined,
    load: erasedLoader,
    mode: "lazy",
  };
}

export function createLatticePlugin(plugin: Plugin): Plugin {
  return plugin;
}

export function createLatticeRegistry(...plugins: Plugin[]): ComponentRegistry {
  return plugins.reduce<ComponentRegistry>(
    (registry, plugin) => ({
      ...registry,
      ...plugin.components,
    }),
    {},
  );
}

export function extendLatticeRegistry(
  registry: ComponentRegistry,
  ...plugins: Plugin[]
): ComponentRegistry {
  return {
    ...registry,
    ...createLatticeRegistry(...plugins),
  };
}
