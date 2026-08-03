import { lazy } from "react";
import type { LazyExoticComponent } from "react";
import type { RendererComponent, RendererComponentModule } from "./types";
import type { EffectHandlerRegistry } from "@lattice-php/lattice/effects/registry";
import type { ColumnRegistry } from "@lattice-php/lattice/table/registry";
import type { ComponentPropsMap } from "@lattice-php/lattice/types/generated";
import { isRecord } from "./materialize";

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

export type ComponentRegistryFor<TTypes extends keyof ComponentPropsMap & string> = Record<
  TTypes,
  ComponentRegistration
>;

export type PluginI18n = {
  /** i18next namespace the plugin's components translate under. */
  namespace: string;
};

export type Plugin = {
  name: string;
  components?: ComponentRegistry;
  columns?: ColumnRegistry;
  effects?: EffectHandlerRegistry;
  i18n?: PluginI18n;
};

export type Registry = {
  components: ComponentRegistry;
  columns: ColumnRegistry;
  effects: EffectHandlerRegistry;
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
): LazyComponentRegistration {
  const erasedLoader = load as unknown as () => Promise<RendererComponentModule>;

  return {
    component: lazy(erasedLoader),
    load: erasedLoader,
    mode: "lazy",
  };
}

const importModule = (url: string): Promise<unknown> => import(/* @vite-ignore */ url);

function componentRegistryIsValid(registry: unknown): boolean {
  return (
    registry === undefined ||
    (isRecord(registry) &&
      Object.values(registry).every(
        (entry) =>
          isRecord(entry) &&
          ((entry.mode === "eager" && typeof entry.component === "function") ||
            (entry.mode === "lazy" &&
              isRecord(entry.component) &&
              typeof entry.load === "function")),
      ))
  );
}

function functionRegistryIsValid(registry: unknown): boolean {
  return (
    registry === undefined ||
    (isRecord(registry) && Object.values(registry).every((entry) => typeof entry === "function"))
  );
}

function pluginFromModule(module: unknown, url: string): Plugin {
  const plugin = isRecord(module) ? module.default : undefined;

  if (
    !isRecord(plugin) ||
    typeof plugin.name !== "string" ||
    plugin.name.trim() === "" ||
    !componentRegistryIsValid(plugin.components) ||
    !functionRegistryIsValid(plugin.columns) ||
    !functionRegistryIsValid(plugin.effects) ||
    (plugin.i18n !== undefined &&
      (!isRecord(plugin.i18n) ||
        typeof plugin.i18n.namespace !== "string" ||
        plugin.i18n.namespace.trim() === ""))
  ) {
    throw new TypeError(`[lattice] Plugin module [${url}] must default export a Plugin object.`);
  }

  return plugin as Plugin;
}

export function loadPluginModules(
  urls: string[],
  load: (url: string) => Promise<unknown> = importModule,
): Promise<Plugin[]> {
  return Promise.all(urls.map(async (url) => pluginFromModule(await load(url), url)));
}

export function createRegistry(...plugins: Plugin[]): Registry {
  return plugins.reduce<Registry>(
    (registry, plugin) => ({
      components: { ...registry.components, ...plugin.components },
      columns: { ...registry.columns, ...plugin.columns },
      effects: { ...registry.effects, ...plugin.effects },
    }),
    { components: {}, columns: {}, effects: {} },
  );
}

export function extendRegistry(registry: Registry, ...plugins: Plugin[]): Registry {
  const merged = createRegistry(...plugins);

  return {
    components: { ...registry.components, ...merged.components },
    columns: { ...registry.columns, ...merged.columns },
    effects: { ...registry.effects, ...merged.effects },
  };
}
