import { createElement, lazy } from "react";
import type { ComponentType } from "react";
import { lazyComponent, type Plugin } from "@lattice-php/core/registry";
import type { MapProviderProps } from "./provider-registry";

type DistPluginModule = {
  default: {
    extensions: {
      "map.providers": {
        googlemaps: ComponentType<MapProviderProps>;
        openstreetmap: ComponentType<MapProviderProps>;
      };
    };
  };
};

const distPlugin = (): Promise<DistPluginModule> => import("../../dist/plugin.js");

const distProvider = (name: keyof DistPluginModule["default"]["extensions"]["map.providers"]) =>
  lazy(async () => {
    const { default: plugin } = await distPlugin();
    const Provider = plugin.extensions["map.providers"][name];

    // React.lazy rejects a lazy component as its resolved value, and the dist
    // artifact exports one — unwrap through a plain component.
    return { default: (props: MapProviderProps) => createElement(Provider, props) };
  });

const OpenStreetMapProvider = distProvider("openstreetmap");
const GoogleMapsProvider = distProvider("googlemaps");

/**
 * The Composer-facing plugin entry: a consumer's Vite build compiles only this
 * shell into the initial bundle. The map component loads lazily from source,
 * and the OpenStreetMap renderer loads Leaflet through the self-contained
 * `dist/plugin.js` artifact — Leaflet never needs to exist in the consumer's
 * node_modules and never ships eagerly. No-build apps use `dist/plugin.js`
 * directly via the `standalone` manifest key instead.
 */
export default {
  name: "lattice/map",
  components: {
    map: lazyComponent(() => import("./map")),
  },
  extensions: {
    "map.providers": {
      openstreetmap: OpenStreetMapProvider,
      googlemaps: GoogleMapsProvider,
    },
  },
  i18n: {
    namespace: "map",
  },
} satisfies Plugin;
