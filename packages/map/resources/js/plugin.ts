import { lazy } from "react";
import { lazyComponent, type Plugin } from "@lattice-php/core/registry";
import type { MapProviderComponent } from "./provider-registry";

const OpenStreetMapProvider = lazy(() => import("./openstreetmap")) as MapProviderComponent;

export default {
  name: "lattice/map",
  components: {
    map: lazyComponent(() => import("./map")),
  },
  extensions: {
    "map.providers": {
      openstreetmap: OpenStreetMapProvider,
    },
  },
  i18n: {
    namespace: "map",
  },
} satisfies Plugin;
