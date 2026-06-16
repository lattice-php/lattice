import { createPlugin, eagerComponent } from "@lattice-php/lattice/core/registry";
import DataListComponent from "./components/data-list";
import ExternalChatBoxComponent from "./components/external-chat-box";

export const remoteComponents = createPlugin({
  components: {
    "remote.data-list": eagerComponent(DataListComponent),
    "remote.external-chat-box": eagerComponent(ExternalChatBoxComponent),
  },
  name: "lattice/remote",
});
