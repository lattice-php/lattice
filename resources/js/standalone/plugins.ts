import type { Plugin } from "@lattice-php/lattice/core/registry";
import { isRecord } from "@lattice-php/lattice/core/materialize";

type ModuleLoader = (url: string) => Promise<unknown>;

const importModule: ModuleLoader = (url) => import(/* @vite-ignore */ url);

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

function i18nIsValid(i18n: unknown): boolean {
  return (
    i18n === undefined ||
    (isRecord(i18n) && typeof i18n.namespace === "string" && i18n.namespace.trim() !== "")
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
    !i18nIsValid(plugin.i18n)
  ) {
    throw new TypeError(`[lattice] Plugin module [${url}] must default export a Plugin object.`);
  }

  return plugin as Plugin;
}

export function loadPluginModules(
  urls: string[],
  load: ModuleLoader = importModule,
): Promise<Plugin[]> {
  return Promise.all(urls.map(async (url) => pluginFromModule(await load(url), url)));
}
