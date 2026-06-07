import { lazy } from "react";
import type { LazyExoticComponent } from "react";
import type { LatticeRendererComponent, LatticeRendererComponentModule } from "./types";

export type LatticeEagerComponentRegistration = {
  component: LatticeRendererComponent;
  mode: "eager";
};

export type LatticeLazyComponentRegistration = {
  component: LazyExoticComponent<LatticeRendererComponent>;
  fallback?: LatticeRendererComponent;
  load: () => Promise<LatticeRendererComponentModule>;
  mode: "lazy";
};

export type LatticeComponentRegistration =
  | LatticeEagerComponentRegistration
  | LatticeLazyComponentRegistration;

export type LatticeComponentRegistry = Record<string, LatticeComponentRegistration>;

export type LatticePlugin = {
  components: LatticeComponentRegistry;
  name: string;
};

export type LatticeLazyComponentOptions<TType extends string> = {
  fallback?: LatticeRendererComponent<TType>;
};

export function eagerComponent<TType extends string>(
  component: LatticeRendererComponent<TType>,
): LatticeEagerComponentRegistration {
  return {
    component: component as LatticeRendererComponent,
    mode: "eager",
  };
}

export function lazyComponent<TType extends string>(
  load: () => Promise<LatticeRendererComponentModule<TType>>,
  options: LatticeLazyComponentOptions<TType> = {},
): LatticeLazyComponentRegistration {
  const erasedLoader = load as unknown as () => Promise<LatticeRendererComponentModule>;

  return {
    component: lazy(erasedLoader),
    fallback: options.fallback as LatticeRendererComponent | undefined,
    load: erasedLoader,
    mode: "lazy",
  };
}

export function createLatticePlugin(plugin: LatticePlugin): LatticePlugin {
  return plugin;
}

export function createLatticeRegistry(...plugins: LatticePlugin[]): LatticeComponentRegistry {
  return plugins.reduce<LatticeComponentRegistry>(
    (registry, plugin) => ({
      ...registry,
      ...plugin.components,
    }),
    {},
  );
}

export function extendLatticeRegistry(
  registry: LatticeComponentRegistry,
  ...plugins: LatticePlugin[]
): LatticeComponentRegistry {
  return {
    ...registry,
    ...createLatticeRegistry(...plugins),
  };
}
