import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { RemoteNodeType } from "@lattice-php/lattice/types/generated";
import DataListComponent from "./components/data-list";

export const remoteComponents: Plugin = {
  components: {
    "remote.data-list": eagerComponent(DataListComponent),
  } satisfies ComponentRegistryFor<RemoteNodeType>,
  name: "lattice/remote",
};
