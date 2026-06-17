import { createPlugin, lazyComponent } from "@lattice-php/lattice";
import { StatusBadgeCell } from "./columns/status-badge";

export const appColumns = createPlugin({
  name: "workbench",
  columns: {
    "column.status-badge": StatusBadgeCell,
  },
  components: {
    "echo-status": lazyComponent(() => import("./components/EchoStatus")),
  },
});
