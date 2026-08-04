import { lazy } from "react";
import type { LazyExoticComponent } from "react";
import type { RendererComponent, RendererComponentModule } from "./index";
import type { ComponentProps } from "./index";
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

type CompleteRegistry = Registry & { extensions: ExtensionRegistries };

const LEGACY_COLUMN_EXTENSION = "table.columns";
const LEGACY_EFFECT_EXTENSION = "effects";

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

function extensionRegistriesAreValid(registries: unknown): boolean {
  return (
    registries === undefined ||
    (isRecord(registries) &&
      Object.values(registries).every(
        (registry) => isRecord(registry) && functionRegistryIsValid(registry),
      ))
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
    !extensionRegistriesAreValid(plugin.extensions) ||
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

function mergeExtensions(
  ...registries: Array<ExtensionRegistries | undefined>
): ExtensionRegistries {
  const merged: ExtensionRegistries = {};

  for (const registriesByName of registries) {
    for (const [name, registry] of Object.entries(registriesByName ?? {})) {
      merged[name] = { ...merged[name], ...registry };
    }
  }

  return merged;
}

function legacyExtensions(
  columns: ExtensionRegistry | undefined,
  effects: ExtensionRegistry | undefined,
): ExtensionRegistries {
  return {
    [LEGACY_COLUMN_EXTENSION]: columns ?? {},
    [LEGACY_EFFECT_EXTENSION]: effects ?? {},
  };
}

function registryWithAliases(
  components: ComponentRegistry,
  extensions: ExtensionRegistries,
): CompleteRegistry {
  return {
    components,
    columns: extensions[LEGACY_COLUMN_EXTENSION] ?? {},
    effects: extensions[LEGACY_EFFECT_EXTENSION] ?? {},
    extensions,
  };
}

export function createRegistry(...plugins: Plugin[]): CompleteRegistry {
  return plugins.reduce<CompleteRegistry>(
    (registry, plugin) =>
      registryWithAliases(
        { ...registry.components, ...plugin.components },
        mergeExtensions(
          registry.extensions,
          legacyExtensions(plugin.columns, plugin.effects),
          plugin.extensions,
        ),
      ),
    registryWithAliases({}, {}),
  );
}

export function extendRegistry(registry: Registry, ...plugins: Plugin[]): CompleteRegistry {
  const merged = createRegistry(...plugins);

  return registryWithAliases(
    { ...registry.components, ...merged.components },
    mergeExtensions(
      legacyExtensions(registry.columns, registry.effects),
      registry.extensions,
      merged.extensions,
    ),
  );
}
