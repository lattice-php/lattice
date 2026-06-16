import { createPlugin, eagerComponent } from "@lattice-php/lattice/core/registry";
import DataListComponent from "./components/data-list";
import RemoteChatBoxComponent from "./components/chat-box";

export const remoteComponents = createPlugin({
  components: {
    "remote.data-list": eagerComponent(DataListComponent),
    "remote.chat-box": eagerComponent(RemoteChatBoxComponent),
  },
  name: "lattice/remote",
});
