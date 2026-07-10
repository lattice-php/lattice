import {
  createPlugin,
  eagerComponent,
  type ComponentRegistryFor,
} from "@lattice-php/lattice/core/registry";
import DataListComponent from "./components/data-list";

export type RemoteComponentType = "remote.data-list";

export const remoteComponents = createPlugin({
  components: {
    "remote.data-list": eagerComponent(DataListComponent),
  } satisfies ComponentRegistryFor<RemoteComponentType>,
  name: "lattice/remote",
});
