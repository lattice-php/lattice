import {
  createPlugin,
  eagerComponent,
  type ComponentRegistryFor,
} from "@lattice-php/lattice/core/registry";
import type { RemoteNodeType } from "@lattice-php/lattice/types/generated";
import DataListComponent from "./components/data-list";

export const remoteComponents = createPlugin({
  components: {
    "remote.data-list": eagerComponent(DataListComponent),
  } satisfies ComponentRegistryFor<RemoteNodeType>,
  name: "lattice/remote",
});
