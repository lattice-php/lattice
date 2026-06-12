import { lazy } from "react";
import type { LazyExoticComponent } from "react";
import type { RendererComponent, RendererComponentModule } from "./types";
import type { ColumnRegistry } from "../table/column-registry";

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
  name: string;
  components?: ComponentRegistry;
  columns?: ColumnRegistry;
};

export type Registry = {
  components: ComponentRegistry;
  columns: ColumnRegistry;
};

export type LazyComponentOptions<TType extends string> = {
  fallback?: RendererComponent<TType>;
};

export function eagerComponent<TType extends string>(
  component: RendererComponent<TType>,
): EagerComponentRegistration {
  return {
    component: component as unknown as RendererComponent,
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

export function createPlugin(plugin: Plugin): Plugin {
  return plugin;
}

export function createRegistry(...plugins: Plugin[]): Registry {
  return plugins.reduce<Registry>(
    (registry, plugin) => ({
      components: { ...registry.components, ...plugin.components },
      columns: { ...registry.columns, ...plugin.columns },
    }),
    { components: {}, columns: {} },
  );
}

export function extendRegistry(registry: Registry, ...plugins: Plugin[]): Registry {
  const merged = createRegistry(...plugins);

  return {
    components: { ...registry.components, ...merged.components },
    columns: { ...registry.columns, ...merged.columns },
  };
}
