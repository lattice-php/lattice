import "./standalone.css";
import {
  createLatticeApp,
  loadPluginModules,
  setRefRefreshEndpoint,
  withVisitHeaders,
} from "@lattice-php/lattice/runtime";
import { readStandaloneConfig } from "./config";

const config = readStandaloneConfig(document);

async function boot(): Promise<void> {
  const plugins = await loadPluginModules(config.plugins ?? []);

  if (config.refreshRefUrl) {
    setRefRefreshEndpoint(config.refreshRefUrl);
  }

  if (config.echo) {
    try {
      const { configureEcho } = await import("@laravel/echo-react");

      configureEcho(config.echo as Parameters<typeof configureEcho>[0]);
    } catch (error) {
      console.warn("[lattice] Failed to load the realtime chunk; continuing without Echo.", error);
    }
  }

  void createLatticeApp({
    plugins,
    ...(config.spriteUrl ? { sprite: { href: config.spriteUrl } } : {}),
    defaults: { visitOptions: withVisitHeaders },
  });
}

export const booted = boot();
