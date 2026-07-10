import "./standalone.css";
import { createLatticeApp } from "@lattice-php/lattice/create-app";
import { withVisitHeaders } from "@lattice-php/lattice/inertia";
import { readStandaloneConfig } from "./config";

const config = readStandaloneConfig(document);

async function boot(): Promise<void> {
  if (config.echo) {
    try {
      const { configureEcho } = await import("@laravel/echo-react");

      configureEcho(config.echo as Parameters<typeof configureEcho>[0]);
    } catch (error) {
      console.warn("[lattice] Failed to load the realtime chunk; continuing without Echo.", error);
    }
  }

  void createLatticeApp({
    ...(config.spriteUrl ? { sprite: { href: config.spriteUrl } } : {}),
    defaults: { visitOptions: withVisitHeaders },
  });
}

void boot();
