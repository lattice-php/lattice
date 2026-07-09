import { createPlugin, eagerComponent } from "@lattice-php/lattice/core/registry";
import DataListComponent from "./components/data-list";

export const remoteComponents = createPlugin({
  components: {
    "remote.data-list": eagerComponent(DataListComponent),
  },
  name: "lattice/remote",
});
