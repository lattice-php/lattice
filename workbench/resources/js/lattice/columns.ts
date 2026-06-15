import { createPlugin, eagerComponent, type RendererComponent } from "@lattice-php/lattice";
import { ChatBox } from "./components/chat-box";
import { StatusBadgeCell } from "./columns/status-badge";

export const appColumns = createPlugin({
  name: "workbench",
  columns: {
    "column.status-badge": StatusBadgeCell,
  },
  components: {
    "workbench.chat": eagerComponent(ChatBox as unknown as RendererComponent),
  },
});
