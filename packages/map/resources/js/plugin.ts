import { lazy } from "react";
import { lazyComponent, type Plugin } from "@lattice-php/core/registry";
import type { MapProviderComponent } from "./provider-registry";

const OpenStreetMapProvider = lazy(() => import("./openstreetmap")) as MapProviderComponent;
const GoogleMapsProvider = lazy(() => import("./googlemaps")) as MapProviderComponent;

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
